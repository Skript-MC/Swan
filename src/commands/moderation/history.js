import { oneLine, stripIndent } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import moment from 'moment';
import { history as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Sanction from '../../models/sanction';
import { constants, splitText, toHumanDuration } from '../../utils';

class HistoryCommand extends Command {
  constructor() {
    super('history', {
      aliases: config.settings.aliases,
      description: { ...config.description },
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

  async exec(message, args) {
    const memberId = args.member?.id || args.member;

    const sanctions = await Sanction.find({ memberId });
    if (sanctions.length === 0)
      return message.util.send(config.messages.notFound);

    const stats = {
      hardbans: sanctions.filter(s => s.type === constants.SANCTIONS.TYPES.HARDBAN).length,
      bans: sanctions.filter(s => s.type === constants.SANCTIONS.TYPES.BAN).length,
      kicks: sanctions.filter(s => s.type === constants.SANCTIONS.TYPES.KICK).length,
    };

    let privateHistory = config.messages.title
      .replace('{NAME}', args.member?.displayName || args.member?.username || args.member)
      .replace('{COUNT}', sanctions.length);

    privateHistory += config.messages.overview
      .replace('{HARDBANS}', stats.hardbans)
      .replace('{BANS}', stats.bans)
      .replace('{KICKS}', stats.kicks);
    privateHistory += '\n\n';

    for (const sanction of sanctions) {
      let infos = config.messages.sanctionDescription.main
        .replace('{NAME}', config.messages.sanctionsName[sanction.type])
        .replace('{ID}', sanction.id)
        .replace('{MODERATOR}', sanction.moderator)
        .replace('{DATE}', moment(sanction.start).format(settings.miscellaneous.durationFormat))
        .replace('{REASON}', sanction.reason);

      if (sanction.duration && sanction.type !== constants.SANCTIONS.TYPES.WARN)
        infos += config.messages.sanctionDescription.duration.replace('{DURATION}', toHumanDuration(sanction.duration));

      infos += '\n';
      if (sanction.updates?.length > 0) {
        infos += config.messages.sanctionDescription.modifications.replace('{PLURAL}', sanction.updates.length > 1 ? 's' : '');
        for (const update of sanction.updates) {
          let diff;

          if (update.type === constants.SANCTIONS.UPDATES.DURATION) {
            diff = stripIndent`
              \`\`\`diff
              - ${toHumanDuration(update.valueBefore)}
              + ${toHumanDuration(update.valueAfter)}
              \`\`\`
            `;
          } else if (update.type === constants.SANCTIONS.UPDATES.REASON) {
            diff = stripIndent`
              \`\`\`diff
              - ${update.valueBefore}
              + ${update.valueAfter}
              \`\`\`
            `;
          } else {
            diff = '\n';
          }

          infos += '        ';
          infos += oneLine`
            - ${moment(update.date).format(settings.miscellaneous.durationFormat)},
            <@${update.moderator}> ${config.messages.updateReasons[update.type]}
            (motif: "${update.reason}")`;
          infos += diff;
        }
      }

      privateHistory += `${infos}\n`;
    }

    const splittedText = splitText(privateHistory);
    try {
      for (const chunk of splittedText)
        /* eslint-disable no-await-in-loop */
        await message.member.send(chunk);
      await message.util.send(config.messages.sentInDm);
    } catch {
      message.util.send(messages.global.dmAreClosed);
    }
  }
}

export default HistoryCommand;
