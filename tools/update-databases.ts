import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ConvictedUser from '../src/models/convictedUser';
import Sanction from '../src/models/sanction';

dotenv.config();

function getNewType(type: string): 'ban' | 'hardban' | 'kick' | 'mute' | 'removeWarn' | 'unban' | 'unmute' | 'warn' {
  switch (type) {
    case 'hardban':
    case 'ban':
    case 'unban':
    case 'mute':
    case 'unmute':
    case 'warn':
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
      return 'duration';
    case 'unban':
    case 'unmute':
    case 'remove_warn':
      return 'revoked';
    default:
      throw new TypeError(`Unexpected sanction update type ${type}`);
  }
}

export interface SanctionNedbSchema {
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
      changes: { reason: string; duration: number }
             | { reason: string; revoked: boolean };
    }>;
  }>;
  count: number;
  currentWarnCount: number;
  _id: string;
  lastBanId: string | null;
  lastMuteId: string | null;
}

void (async (): Promise<void> => {
  console.log('Starting conversion of sanction databases from v1 to v2...');

  const rawContent = await fs.readFile(path.join(__dirname, '..', '..', 'databases', 'sanctionsHistory.db'));
  const parsableContent = `[${rawContent}]`;
  const inputArray: SanctionNedbSchema[] = JSON.parse(parsableContent);

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


  // Iterate through all the old "histories". We don't care about the old "sanctions" database because it
  // only contains sanctions happening currently, whereas history contains all the sanction...
  for (const [i, document] of inputArray.entries()) {
    // Add the user to the database of the convicted users (= users that have had at least 1 sanction).
    const { _id: userId } = await ConvictedUser.create({
      memberId: document.memberId,
      lastBanId: document.lastBanId,
      lastMuteId: document.lastMuteId,
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
        finish: sanction.date + sanction.duration || null,
        reason: sanction.reason,
        revoked: sanction.revoked ?? false,
        sanctionId: sanction.id,
        informations: {
          shouldAutobanIfNoMessages: false,
        },
        updates,
      });
    }
    // Draw the progress bar
    const dots = '.'.repeat(i);
    const left = inputArray.length - i;
    const empty = ' '.repeat(left);
    process.stdout.write(`\r[${dots}${empty}]   |   ${i + 1}/${inputArray.length}${i + 1 === inputArray.length ? '\n' : ''}`);
  }

  console.log('Conversion was successful! You can now check your mongodb database to verify that everything is good, and you can delete the old database (./databases/sanctions.db and ./databases/sanctionsHistory.db)');
  // eslint-disable-next-line node/no-process-exit
  process.exit(0);
})();
