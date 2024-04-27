import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type {
  ApplicationCommandOptionData,
  AutocompleteInteraction,
} from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { removeWarn as config } from '#config/commands/moderation';
import * as messages from '#config/messages';
import { Sanction } from '#models/sanction';
import { ModerationData } from '#moderation/ModerationData';
import { RemoveWarnAction } from '#moderation/actions/RemoveWarnAction';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { SanctionTypes } from '#types/index';
import { nullop } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class RemoveWarnCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: 'Révoquer un avertissement de ce membre',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'avertissement',
      description: "Sélectionnez l'avertissement à révoquer",
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'raison',
      description: "Raison de la révocation de l'avertissement",
      required: false,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction<'cached'>,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(
      interaction,
      interaction.options.getString('avertissement', true),
      interaction.options.getString('raison') ?? messages.global.noReason,
    );
  }

  public override async autocompleteRun(
    interaction: AutocompleteInteraction<'cached'>,
  ): Promise<void> {
    const sanctions = await Sanction.find({
      userId: interaction.options.get('membre', true).value as string,
      revoked: false,
    }).catch(nullop);
    await interaction.respond(
      sanctions?.slice(0, 20).map((entry) => ({
        name: `${entry.sanctionId} — ${entry.reason}`,
        value: entry.sanctionId,
      })) ?? [],
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction<'cached'>,
    warnId: string,
    reason: string,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const warn = await Sanction.findOne({
      sanctionId: warnId,
      revoked: false,
    }).catch(nullop);
    if (!warn) {
      await interaction.followUp(config.messages.invalidWarnId);
      return;
    }

    const member =
      interaction.guild.members.cache.get(warn.userId) ??
      (await interaction.guild.members.fetch(warn.userId).catch(nullop));
    if (!member) {
      await interaction.followUp(config.messages.memberNotFound);
      return;
    }

    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.followUp(messages.moderation.alreadyModerated);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    try {
      const data = new ModerationData(interaction)
        .setSanctionId(warn.sanctionId)
        .setVictim({ id: member.id, name: member.displayName })
        .setReason(reason)
        .setType(SanctionTypes.RemoveWarn);

      const success = await new RemoveWarnAction(data).commit();
      if (success) await interaction.followUp(config.messages.success);
    } catch (unknownError: unknown) {
      this.container.logger.error(
        'An unexpected error occurred while removing a warn from member!',
      );
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.followUp(messages.global.oops);
    }
  }
}
