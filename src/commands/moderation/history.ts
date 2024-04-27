import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type {
  ApplicationCommandOptionData,
  EmbedField,
  User,
} from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  TimestampStyles,
  time as timeFormatter,
} from 'discord.js';
import pupa from 'pupa';
import { history as config } from '#config/commands/moderation';
import * as messages from '#config/messages';
import { colors, moderation } from '#config/settings';
import { Sanction } from '#models/sanction';
import { PaginatedMessageEmbedFields } from '#structures/PaginatedMessageEmbedFields';
import { SwanCommand } from '#structures/commands/SwanCommand';
import type { SanctionDocument } from '#types/index';
import { SanctionTypes, SanctionsUpdates } from '#types/index';
import { getUsername, toHumanDuration } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class HistoryCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: "Consulter l'historique de ce membre",
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getUser('membre', true));
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    user: User,
  ): Promise<void> {
    const rawSanctions = await Sanction.find({ userId: user.id });
    if (rawSanctions.length === 0) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    const sanctions = rawSanctions.reverse();

    const fields: EmbedField[] = sanctions.map((sanc) => ({
      ...this._getSanctionContent(sanc),
      inline: false,
    }));

    // Get all the statistics.
    const stats = {
      hardbans: sanctions.filter((s) => s.type === SanctionTypes.Hardban)
        .length,
      bans: sanctions.filter((s) => s.type === SanctionTypes.TempBan).length,
      mutes: sanctions.filter((s) => s.type === SanctionTypes.Mute).length,
      kicks: sanctions.filter((s) => s.type === SanctionTypes.Kick).length,
      currentWarns: sanctions.filter(
        (s) => s.type === SanctionTypes.Warn && !s.revoked,
      ).length,
      warns: sanctions.filter((s) => s.type === SanctionTypes.Warn).length,
    };

    const sanctionUrl = moderation.dashboardSanctionLink + user.id;
    const embed = new EmbedBuilder()
      .setTitle(
        pupa(config.messages.title, { name: getUsername(user), sanctions }),
      )
      .setURL(sanctionUrl)
      .setDescription(
        pupa(config.messages.overview, {
          stats,
          warnLimit: moderation.warnLimitBeforeBan,
        }),
      )
      .setColor(colors.default)
      .setTimestamp();

    const allowedUser = await this.container.client.users.fetch(
      interaction.user.id,
    );
    await new PaginatedMessageEmbedFields()
      .setTemplate(embed)
      .setItems(fields)
      .setItemsPerPage(3)
      .make()
      .run(interaction, allowedUser);
  }

  private _getSanctionContent(
    sanction: SanctionDocument,
  ): Omit<EmbedField, 'inline'> {
    let sanctionContent = pupa(config.messages.sanctionDescription.content, {
      name: config.messages.sanctionsName[sanction.type],
      date: timeFormatter(
        Math.round(sanction.start / 1000),
        TimestampStyles.LongDateTime,
      ),
      sanction,
    });

    if (sanction.duration && sanction.type !== SanctionTypes.Warn) {
      sanctionContent += pupa(config.messages.sanctionDescription.duration, {
        duration: toHumanDuration(sanction.duration),
      });
    }

    sanctionContent += '\n';
    if (sanction.updates?.length) {
      sanctionContent += pupa(
        config.messages.sanctionDescription.modifications,
        {
          plural: sanction.updates?.length > 1 ? 's' : '',
        },
      );

      for (const update of sanction.updates) {
        // If there is a duration update, show it with a nice diff.
        const diff =
          update.type === SanctionsUpdates.Duration
            ? pupa(config.messages.sanctionDescription.timeDiff, {
                valueBefore: update.valueBefore
                  ? toHumanDuration(update.valueBefore)
                  : messages.global.unknown(true),
                valueAfter: update.valueAfter
                  ? toHumanDuration(update.valueAfter)
                  : messages.global.unknown(true),
              })
            : '\n';

        sanctionContent += pupa(config.messages.sanctionDescription.update, {
          date: timeFormatter(
            Math.round(update.date / 1000),
            TimestampStyles.LongDateTime,
          ),
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
