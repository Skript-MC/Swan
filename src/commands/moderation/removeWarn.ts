import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, AutocompleteInteraction } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { ApplySwanOptions } from '@/app/decorators/swanOptions';
import { Sanction } from '@/app/models/sanction';
import { ModerationData } from '@/app/moderation/ModerationData';
import { RemoveWarnAction } from '@/app/moderation/actions/RemoveWarnAction';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import { removeWarn as config } from '@/conf/commands/moderation';
import * as messages from '@/conf/messages';

@ApplySwanOptions(config)
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
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(
      interaction,
      interaction.options.getString('avertissement', true),
      interaction.options.getString('raison') ?? messages.global.noReason,
    );
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const sanctions = await Sanction.find({
      userId: interaction.options.get('membre', true).value,
      revoked: false,
    }).catch(nullop);
    await interaction.respond(
      sanctions
        .slice(0, 20)
        .map(entry => ({
          name: entry.sanctionId + ' — ' + entry.reason,
          value: entry.sanctionId,
        })),
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    warnId: string,
    reason: string,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const warn = await Sanction.findOne({ sanctionId: warnId, revoked: false }).catch(nullop);
    if (!warn) {
      await interaction.followUp(config.messages.invalidWarnId).catch(noop);
      return;
    }

    const member = interaction.guild.members.cache.get(warn.userId)
      ?? await interaction.guild.members.fetch(warn.userId).catch(nullop);
    if (!member) {
      await interaction.followUp(config.messages.memberNotFound);
      return;
    }

    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.followUp(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    try {
      const data = new ModerationData(interaction)
        .setSanctionId(warn.sanctionId)
        .setVictim(member)
        .setReason(reason)
        .setType(SanctionTypes.RemoveWarn);

      const success = await new RemoveWarnAction(data).commit();
      if (success)
        await interaction.followUp(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while removing a warn from member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.followUp(messages.global.oops).catch(noop);
    }
  }
}
