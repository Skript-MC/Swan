import { oneLine, stripIndent } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import moment from 'moment';
import pupa from 'pupa';
import { history as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Sanction from '../../models/sanction';
import { SanctionsUpdates, SanctionTypes } from '../../types';
import type { GuildMessage } from '../../types';
import type { HistoryCommandArgument } from '../../types/CommandArguments';
import {
  getUsername,
  noop,
  splitText,
  toHumanDuration,
 } from '../../utils';

class HistoryCommand extends Command {
  constructor() {
    super('history', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'member',
        type: Argument.union('member', 'user', 'string'),
        prompt: {
          start: config.messages.promptStartUser,
          retry: config.messages.promptStartUser,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: HistoryCommandArgument): Promise<void> {
    const memberId = typeof args.member === 'string' ? args.member : args.member.id;

    const sanctions = await Sanction.find({ memberId });
    if (sanctions.length === 0) {
      await message.util.send(config.messages.notFound);
      return;
    }

    const stats = {
      hardbans: sanctions.filter(s => s.type === SanctionTypes.Hardban).length,
      bans: sanctions.filter(s => s.type === SanctionTypes.Ban).length,
      mutes: sanctions.filter(s => s.type === SanctionTypes.Mute).length,
      kicks: sanctions.filter(s => s.type === SanctionTypes.Kick).length,
    };

    let privateHistory = pupa(config.messages.title, { name: getUsername(args.member), sanctions });

    privateHistory += pupa(config.messages.overview, { stats, warnLimit: settings.moderation.warnLimitBeforeBan });
    privateHistory += '\n\n';

    for (const sanction of sanctions) {
      let stringBuilder = pupa(config.messages.sanctionDescription.main, {
        name: config.messages.sanctionsName[sanction.type],
        date: moment(sanction.start).format(settings.miscellaneous.durationFormat),
        sanction,
      });

      if (sanction.duration && sanction.type !== SanctionTypes.Warn) {
        stringBuilder += pupa(config.messages.sanctionDescription.duration, {
          duration: toHumanDuration(sanction.duration),
        });
      }

      stringBuilder += '\n';
      if (sanction.updates?.length) {
        stringBuilder += pupa(config.messages.sanctionDescription.modifications, {
          plural: sanction.updates?.length > 1 ? 's' : '',
        });

        for (const update of sanction.updates) {
          const diff = update.type === SanctionsUpdates.Duration
            ? stripIndent`

                \`\`\`diff
                - ${toHumanDuration(update.valueBefore)}
                + ${toHumanDuration(update.valueAfter)}
                \`\`\`
              `
            : '\n';

          stringBuilder += '        ';
          stringBuilder += oneLine`
            - ${moment(update.date).format(settings.miscellaneous.durationFormat)},
            <@${update.moderator}> ${config.messages.updateReasons[update.type]}
            (motif: "${update.reason}")`;
            stringBuilder += diff;
        }
      }

      privateHistory += `${stringBuilder}\n`;
    }

    const splittedText = splitText(privateHistory);
    try {
      for (const chunk of splittedText)
        await message.member.send(chunk);
      await message.util.send(config.messages.sentInDm);
    } catch {
      await message.util.send(messages.global.dmAreClosed).catch(noop);
    }
  }
}

export default HistoryCommand;