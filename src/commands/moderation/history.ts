import type { ChatInputCommand } from '@sapphire/framework';
import type {
 ApplicationCommandOptionData, CommandInteraction, EmbedField, User,
} from 'discord.js';
import { Formatters, Message, MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import Sanction from '@/app/models/sanction';
import PaginatedMessageEmbedFields from '@/app/structures/PaginatedMessageEmbedFields';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SanctionDocument } from '@/app/types';
import { SanctionsUpdates, SanctionTypes } from '@/app/types';
import { getUsername, toHumanDuration } from '@/app/utils';
import { history as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class HistoryCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: "Consulter l'historique de ce membre",
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getUser('membre'));
  }

  private async _exec(interaction: CommandInteraction, user: User): Promise<void> {
    const sanctions = await Sanction.find({ memberId: user.id });
    if (sanctions.length === 0) {
      await interaction.reply(config.messages.notFound);
      return;
    }

    const fields: EmbedField[] = sanctions.map(sanc => ({ ...this._getSanctionContent(sanc), inline: false }));

    // Get all the statistics.
    const stats = {
      hardbans: sanctions.filter(s => s.type === SanctionTypes.Hardban).length,
      bans: sanctions.filter(s => s.type === SanctionTypes.Ban).length,
      mutes: sanctions.filter(s => s.type === SanctionTypes.Mute).length,
      kicks: sanctions.filter(s => s.type === SanctionTypes.Kick).length,
      currentWarns: sanctions.filter(s => s.type === SanctionTypes.Warn && !s.revoked).length,
      warns: sanctions.filter(s => s.type === SanctionTypes.Warn).length,
    };

    const sanctionUrl = settings.moderation.dashboardSanctionLink + user.id;
    const embed = new MessageEmbed()
      .setTitle(pupa(config.messages.title, { name: getUsername(user), sanctions }))
      .setURL(sanctionUrl)
      .setDescription(pupa(config.messages.overview, { stats, warnLimit: settings.moderation.warnLimitBeforeBan }))
      .setColor(settings.colors.default)
      .setTimestamp();


    const defer = await interaction.deferReply({ fetchReply: true });
    if (!(defer instanceof Message))
      return;
    const allowedUser = await this.container.client.users.fetch(interaction.member.user.id);
    await new PaginatedMessageEmbedFields()
      .setTemplate(embed)
      .setItems(fields)
      .setItemsPerPage(3)
      .make()
      .run(defer, allowedUser);
    await interaction.followUp({});
  }

  private _getSanctionContent(sanction: SanctionDocument): Omit<EmbedField, 'inline'> {
    let sanctionContent = pupa(config.messages.sanctionDescription.content, {
      name: config.messages.sanctionsName[sanction.type],
      date: Formatters.time(Math.round(sanction.start / 1000), Formatters.TimestampStyles.LongDateTime),
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
          date: Formatters.time(Math.round(update.date / 1000), Formatters.TimestampStyles.LongDateTime),
          sanction,
          update,
          action: config.messages.updateReasons[update.type],
        });
        sanctionContent += diff;
      }
    }

    return {
      name: pupa(config.messages.sanctionDescription.title, {
        name: config.messages.sanctionsName[sanction.type],
        sanction,
      }),
      value: sanctionContent,
    };
  }
}
