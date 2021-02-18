import { Argument, Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import Sanction from '@/app/models/sanction';
import { SanctionsUpdates, SanctionTypes } from '@/app/types';
import type { GuildMessage, SanctionDocument } from '@/app/types';
import type { HistoryCommandArgument } from '@/app/types/CommandArguments';
import { getUsername, toHumanDuration } from '@/app/utils';
import { history as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

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

    const sanctions: SanctionDocument[] = await Sanction.find({ memberId });
    if (sanctions.length === 0) {
      await message.channel.send(config.messages.notFound);
      return;
    }

    // Get all the statistics.
    const stats = {
      hardbans: sanctions.filter(s => s.type === SanctionTypes.Hardban).length,
      bans: sanctions.filter(s => s.type === SanctionTypes.Ban).length,
      mutes: sanctions.filter(s => s.type === SanctionTypes.Mute).length,
      kicks: sanctions.filter(s => s.type === SanctionTypes.Kick).length,
      currentWarns: sanctions.filter(s => s.type === SanctionTypes.Warn && !s.revoked).length,
      warns: sanctions.filter(s => s.type === SanctionTypes.Warn).length,
    };

    const sanctionUrl = settings.moderation.dashboardSanctionLink + memberId;
    const embed = new MessageEmbed()
      .setTitle(pupa(config.messages.title, { name: getUsername(args.member), sanctions }))
      .setURL(sanctionUrl)
      .setDescription(pupa(config.messages.overview, { stats, warnLimit: settings.moderation.warnLimitBeforeBan }))
      .setColor(settings.colors.default)
      .setTimestamp();

    for (const [i, sanction] of sanctions.entries()) {
      // Cap the sanctions displayed in the embed to 3.
      if (i >= 4) {
        embed.addField(
          pupa(config.messages.overflowTitle, { overflowed: sanctions.length - 4 }),
          pupa(config.messages.overflowDescription, { url: sanctionUrl }),
        );
        break;
      }

      let sanctionContent = pupa(config.messages.sanctionDescription.content, {
        name: config.messages.sanctionsName[sanction.type],
        date: moment(sanction.start).format(settings.miscellaneous.durationFormat),
        sanction,
      });

      if (sanction.duration && sanction.type !== SanctionTypes.Warn) {
        sanctionContent += pupa(config.messages.sanctionDescription.duration, {
          duration: toHumanDuration(sanction.duration),
        });
      }

      sanctionContent += '\n';
      if (sanction.updates?.length) {
        sanctionContent += pupa(config.messages.sanctionDescription.modifications, {
          plural: sanction.updates?.length > 1 ? 's' : '',
        });

        for (const update of sanction.updates) {
          // If there is a duration update, show it with a nice diff.
          const diff = update.type === SanctionsUpdates.Duration
            ? pupa(config.messages.sanctionDescription.timeDiff, {
                valueBefore: update.valueBefore ? toHumanDuration(update.valueBefore) : messages.global.unknown(true),
                valueAfter: update.valueAfter ? toHumanDuration(update.valueAfter) : messages.global.unknown(true),
              })
            : '\n';

          sanctionContent += pupa(config.messages.sanctionDescription.update, {
            date: moment(update.date).format(settings.miscellaneous.durationFormat),
            sanction,
            update,
            action: config.messages.updateReasons[update.type],
          });
          sanctionContent += diff;
        }
      }

      embed.addField(
        pupa(config.messages.sanctionDescription.title, {
          name: config.messages.sanctionsName[sanction.type],
          sanction,
        }),
        sanctionContent,
      );
    }

    await message.channel.send(embed);
  }
}

export default HistoryCommand;
