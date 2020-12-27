import { oneLine, stripIndent } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import moment from 'moment';
import { history as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Sanction from '../../models/sanction';
import type { HistoryCommandArgument } from '../../types/CommandArguments';
import { SanctionsUpdates, SanctionCreations } from '../../types/sanctionsTypes';
import type { GuildMessage } from '../../types/utils';
import { noop, splitText, toHumanDuration } from '../../utils';

class HistoryCommand extends Command {
  constructor() {
    super('history', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'member',
        type: Argument.union('member', 'user'),
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
      hardbans: sanctions.filter(s => s.type === SanctionCreations.Hardban).length,
      bans: sanctions.filter(s => s.type === SanctionCreations.Ban).length,
      mutes: sanctions.filter(s => s.type === SanctionCreations.Mute).length,
      kicks: sanctions.filter(s => s.type === SanctionCreations.Kick).length,
    };

    let privateHistory = config.messages.title
      // @ts-expect-error
      .replace('{NAME}', args.member?.displayName || args.member?.username || args.member)
      .replace('{COUNT}', sanctions.length.toString());

    privateHistory += config.messages.overview
      .replace('{HARDBANS}', stats.hardbans)
      .replace('{BANS}', stats.bans)
      .replace('{MUTES}', stats.mutes)
      .replace('{KICKS}', stats.kicks);
    privateHistory += '\n\n';

    for (const sanction of sanctions) {
      let infos = config.messages.sanctionDescription.main
        .replace('{NAME}', config.messages.sanctionsName[sanction.type])
        .replace('{ID}', sanction.id)
        .replace('{MODERATOR}', sanction.moderator)
        .replace('{DATE}', moment(sanction.start).format(settings.miscellaneous.durationFormat))
        .replace('{REASON}', sanction.reason);

      if (sanction.duration && sanction.type !== SanctionCreations.Warn)
        infos += config.messages.sanctionDescription.duration.replace('{DURATION}', toHumanDuration(sanction.duration));

      infos += '\n';
      if (sanction.updates?.length > 0) {
        infos += config.messages.sanctionDescription.modifications.replace('{PLURAL}', sanction.updates.length > 1 ? 's' : '');
        for (const update of sanction.updates) {
          const diff = update.type === SanctionsUpdates.Duration
            ? stripIndent`
                \`\`\`diff
                - ${toHumanDuration(update.valueBefore)}
                + ${toHumanDuration(update.valueAfter)}
                \`\`\`
              `
            : '\n';

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
        await message.member.send(chunk);
      await message.util.send(config.messages.sentInDm);
    } catch {
      await message.util.send(messages.global.dmAreClosed).catch(noop);
    }
  }
}

export default HistoryCommand;
