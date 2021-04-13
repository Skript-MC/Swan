import 'source-map-support/register';
import 'module-alias/register';
import 'dotenv/config';

import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import CommandStat from '../src/models/commandStat';
import ConvictedUser from '../src/models/convictedUser';
import Sanction from '../src/models/sanction';
import { SanctionsUpdates, SanctionTypes } from '../src/types';
import { noop } from '../src/utils';

function getNewType(type: string): 'ban' | 'hardban' | 'kick' | 'mute' | 'removeWarn' | 'unban' | 'unmute' | 'warn' {
  switch (type) {
    case 'hardban':
    case 'ban':
    case 'unban':
    case 'mute':
    case 'unmute':
    case 'warn':
    case 'kick':
      return type;
    case 'remove_warn':
      return 'removeWarn';
    default:
      throw new TypeError(`Unexpected sanction type ${type}`);
  }
}

function getNewUpdateType(type: string): 'duration' | 'revoked' {
  switch (type) {
    case 'hardban':
    case 'ban':
    case 'kick':
      return 'duration';
    case 'unban':
    case 'unmute':
    case 'remove_warn':
      return 'revoked';
    default:
      throw new TypeError(`Unexpected sanction update type ${type}`);
  }
}

const commandMap = new Map([
  ['8ball', 'eightBall'],
  ['Addon Info', 'addonInfo'],
  ['Addon Pack', 'addonPack'],
  ['Automatic Messages', 'autoMessage'],
  ['Ban', 'ban'],
  ['Code', 'code'],
  ['Discover', 'discover'],
  ['Error Details', 'errorDetails'],
  ['Help', 'help'],
  ['History', 'history'],
  ['Idée', 'idea'],
  ['Joke', 'joke'],
  ['Kick', 'kick'],
  ['Links', 'links'],
  ['Move Message', 'move'],
  ['Mute', 'mute'],
  ['Ping', 'ping'],
  ['Poll', 'poll'],
  ['Purge', 'purge'],
  ['Remove Warn', 'removeWarn'],
  ['Server Info', 'serverInfo'],
  ['Skript Info', 'skriptInfo'],
  ['Statistics', 'statistics'],
  ['Syntax Info', 'documentation'],
  ['Unban', 'unban'],
  ['Unmute', 'unmute'],
  ['User Info', 'userInfo'],
  ['Warn', 'warn'],
]);

interface SanctionNedbSchema {
  memberId: string;
  sanctions: Array<{
    id: string;
    modId: string;
    type: string;
    reason: string;
    date: number;
    duration?: number;
    revoked: boolean;
    updates: Array<{
      date: number;
      modId: string;
      type: string;
      changes: { reason: string; duration: number; revoked: boolean };
    }>;
  }>;
  count: number;
  currentWarnCount: number;
  _id: string;
  lastBanId: string | null;
  lastMuteId: string | null;
}

interface CommandStatsNedbSchema {
  command: '8ball' | 'Addon Info' | 'Addon Pack' | 'Automatic Messages' | 'Ban' | 'Bassboost' | 'Change Config' | 'Code' | 'Discover' | 'Edit Messages' | 'Error Details' | 'Ghostping' | 'Help' | 'History' | 'Idée' | 'Join' | 'Joke' | 'Kick' | 'Leave' | 'Links' | 'Loop' | 'Move Message' | 'Mute' | 'Now Playing' | 'Pause' | 'Ping' | 'Play' | 'Player Info' | 'Poll' | 'Purge' | 'Queue' | 'Ranking' | 'Remove Warn' | 'Rules' | 'Server Info' | 'Shuffle' | 'Skip' | 'Skript Info' | 'Statistics' | 'Status' | 'Stop' | 'Tag Role' | 'Toggle role notification' | 'Unban' | 'Unmute' | 'User Info' | 'Volume' | 'Warn';
  used: number;
  _id: string;
}

async function migrateSanctions(sanctionInputArray: SanctionNedbSchema[]): Promise<void> {
  // Iterate through all the old "histories". We don't care about the old "sanctions" database because it
  // only contains sanctions happening currently, whereas history contains all the sanction...
  for (const [i, document] of sanctionInputArray.entries()) {
    // Add the user to the database of the convicted users (= users that have had at least 1 sanction).
    const { _id: userId } = await ConvictedUser.findOneOrCreate({ memberId: document.memberId }, {
      memberId: document.memberId,
      currentBanId: document.lastBanId,
      currentMuteId: document.lastMuteId,
      currentWarnCount: document.currentWarnCount,
    });

    // Iterate throught all the sanctions of the user
    for (const sanction of document.sanctions) {
      // Build the "update" array. We do this separatly as it is quite long to do because there is a lot of differences
      const updates = [];
      for (const [j, update] of sanction.updates.entries()) {
        const valueBefore = 'duration' in update.changes
          ? sanction.updates[j - 1] ?? sanction.duration ?? null
          : null;
        const valueAfter = 'duration' in update.changes
          ? update.changes.duration ?? null
          : null;
        updates.push({
          date: update.date,
          moderator: update.modId,
          type: getNewUpdateType(update.type),
          valueBefore,
          valueAfter,
          reason: update.changes.reason ?? 'Inconnue',
        });
      }

      // Add the sanction to the Sanction database
      await Sanction.create({
        memberId: document.memberId,
        user: userId,
        type: getNewType(sanction.type),
        moderator: sanction.modId,
        start: sanction.date,
        duration: sanction.duration ?? -1,
        finish: (sanction.date + sanction.duration) || null,
        reason: sanction.reason,
        revoked: sanction.updates.some(sanc => sanc.changes.revoked) ?? sanction.revoked ?? false,
        sanctionId: sanction.id,
        informations: {
          shouldAutobanIfNoMessages: false,
        },
        updates,
      });
    }

    process.stdout.write(`\r${i + 1}/${sanctionInputArray.length}`);
  }
}

async function fixRevoke1(sanctionInputArray: SanctionNedbSchema[]): Promise<void> {
  const justSanctions = sanctionInputArray.flatMap(hist => hist.sanctions);
  const abnormalSanctions = await Sanction.find({
    revoked: false,
    finish: { $lte: Date.now(), $ne: -1 },
  });
  for (const [i, sanction] of abnormalSanctions.entries()) {
    const oldSanction = justSanctions.find(sanc => sanc.id === sanction.sanctionId);
    const user = await ConvictedUser.findOneAndUpdate({ memberId: sanction.memberId }, { currentBanId: null });
    await Sanction.findOneAndUpdate(
      { sanctionId: user.currentBanId },
      {
        $set: { revoked: true },
        $push: {
          updates: {
            date: oldSanction.date || Date.now(),
            moderator: oldSanction.modId || '205963594658086912',
            type: SanctionsUpdates.Revoked,
            reason: oldSanction.reason || 'Migration de la BDD corrompue [E1] (automatique)',
          },
        },
      },
    );

    process.stdout.write(`\r${i + 1}/${abnormalSanctions.length}`);
  }
}

async function fixRevoke2(): Promise<void> {
  const abnormalSanctions = (await Sanction.find()).filter(sanction => !sanction.revoked
    && sanction.type === SanctionTypes.Ban
    && sanction.user.currentBanId !== sanction.sanctionId);

  for (const [i, sanction] of abnormalSanctions.entries()) {
    await Sanction.findOneAndUpdate(
      { sanctionId: sanction.sanctionId },
      {
        $set: { revoked: true },
        $push: {
          updates: {
            date: Date.now(),
            moderator: '205963594658086912',
            type: SanctionsUpdates.Revoked,
            reason: 'Migration de la BDD corrompue [E2] (automatique)',
          },
        },
      },
    );

    process.stdout.write(`\r${i + 1}/${abnormalSanctions.length}`);
  }
}

async function fixWarns(): Promise<void> {
  const abnormalSanctions = await Sanction.find({
    revoked: false,
    type: SanctionTypes.Warn,
    finish: { $lte: Date.now(), $ne: -1 },
  });

  for (const [i, sanction] of abnormalSanctions.entries()) {
    await Sanction.findOneAndUpdate(
      { sanctionId: sanction.sanctionId },
      {
        $set: { revoked: true },
        $push: {
          updates: {
            date: Date.now(),
            moderator: '205963594658086912',
            type: SanctionsUpdates.Revoked,
            reason: 'Migration de la BDD corrompue [E3] (automatique)',
          },
        },
      },
    );

    process.stdout.write(`\r${i + 1}/${abnormalSanctions.length}`);
  }
}

async function migrateCommands(commandStatsInputArray: CommandStatsNedbSchema[]): Promise<void> {
  for (const [i, document] of commandStatsInputArray.entries()) {
    const commandId = commandMap.get(document.command);
    if (commandId) {
      await CommandStat.create({
        commandId,
        uses: document.used,
      });
    }

    process.stdout.write(`\r${i + 1}/${commandStatsInputArray.length}`);
  }
}

async function start(): Promise<void> {
  console.log('[0/4] Connecting to database...');

  const rawSanctionContent = await fs.readFile(path.join(__dirname, '..', '..', 'databases', 'sanctionsHistory.db'));
  const sanctionInputArray: SanctionNedbSchema[] = JSON.parse(`[${rawSanctionContent.toString().split('\n').join(',').slice(0, -1)}]`);

  const rawCommandStatsContent = await fs.readFile(path.join(__dirname, '..', '..', 'databases', 'commandsStats.db'));
  const commandStatsInputArray: CommandStatsNedbSchema[] = JSON.parse(`[${rawCommandStatsContent.toString().split('\n').join(',').slice(0, -1)}]`);

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  mongoose.connection.on('connected', () => {
    console.log('MongoDB is connected!');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error. Please make sure MongoDB is running.');
    throw err;
  });

  console.log('[1/4] Cleaning Mongo databases...');
  await mongoose.connection.db.dropCollection('convictedusers').catch(noop);
  await mongoose.connection.db.dropCollection('sanctions').catch(noop);
  await mongoose.connection.db.dropCollection('commandstats').catch(noop);

  console.log('[2/4] Starting conversion of sanction databases...');
  await migrateSanctions(sanctionInputArray);

  console.log('\n[3/4] Patching sanctions (1/3)...');
  await fixRevoke1(sanctionInputArray);

  console.log('\n[3/4] Patching sanctions (2/3)...');
  await fixRevoke2();

  console.log('\n[3/4] Patching sanctions (3/3)...');
  await fixWarns();

  console.log('\n[4/4] Starting conversion of command database...');
  await migrateCommands(commandStatsInputArray);

  console.log('\nConversion was successful! You can now check your MongoDB database to verify that everything is good, and you can delete the old databases (./databases/sanctions.db, ./databases/sanctionsHistory.db, ./databases/commandStats.db)');
  // eslint-disable-next-line node/no-process-exit
  process.exit(0);
}
void start();
