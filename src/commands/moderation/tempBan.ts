import { ApplyOptions } from '@sapphire/decorators';
import type { ContextMenuCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, GuildMember } from 'discord.js';
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { tempBan as config } from '#config/commands/moderation';
import * as messages from '#config/messages';
import { ModerationData } from '#moderation/ModerationData';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { BanAction } from '#moderation/actions/BanAction';
import { resolveDuration, resolveSanctionnableMember } from '#resolvers/index';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { SanctionTypes } from '#types/index';
import { noop } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class SdbCommand extends SwanCommand {
  commandType = ApplicationCommandType.User;
  commandOptions: ApplicationCommandOptionData[] = [];

  public override async contextMenuRun(
    interaction: SwanCommand.ContextMenuInteraction,
    _context: ContextMenuCommand.RunContext,
  ): Promise<void> {
    const moderator = await this.container.client.guild.members.fetch(interaction.member.user.id);
    const potentialVictim = await this.container.client.guild.members.fetch(interaction.targetId).catch(noop);
    if (!potentialVictim) {
      await interaction.reply({ content: messages.prompt.member, ephemeral: true });
      return;
    }

    const victim = resolveSanctionnableMember(potentialVictim, moderator);
    if (victim.isErr()) {
      await interaction.reply({ content: messages.prompt.member, ephemeral: true });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('tempban')
      .setTitle('Bannissement temporaire');

    const durationInput = new TextInputBuilder()
      .setCustomId('duration')
      .setLabel('Durée du bannissement')
      .setPlaceholder('1j 2h 3min 4s')
      .setMinLength(1)
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setLabel('Raison du bannissement')
      .setPlaceholder("Il n'était pas gentil")
      .setCustomId('reason')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput);
    const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);

    modal.addComponents(firstRow, secondRow);
    await interaction.showModal(modal);

    const submitInteraction = await interaction.awaitModalSubmit({
      filter: i => i.user.id === interaction.user.id,
      time: 30_000,
    });

    const reason = submitInteraction.fields.getTextInputValue('reason');
    const duration = resolveDuration(submitInteraction.fields.getTextInputValue('duration'), false);
    if (duration.isErr()) {
      await submitInteraction.reply({ content: messages.prompt.duration, ephemeral: true });
      return;
    }

    await this._exec(
      submitInteraction,
      victim.unwrap(),
      duration.unwrap(),
      reason,
    );
  }

  private async _exec(
    interaction: SwanCommand.ModalSubmitInteraction,
    member: GuildMember,
    duration: number,
    reason: string,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.followUp(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    const data = new ModerationData(interaction)
      .setType(SanctionTypes.TempBan)
      .setDuration(duration, true)
      .setVictim(member)
      .setReason(reason);

    // If there's a current ban, we set the sanctionId to the current ban's sanctionId
    const currentTempBan = await ModerationHelper.getCurrentBan(member.id);
    if (currentTempBan)
      data.setSanctionId(currentTempBan.sanctionId);

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await interaction.followUp(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while banning a member!');
      this.container.logger.info(`Duration: ${duration}`);
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.followUp(messages.global.oops).catch(noop);
    }
  }
}
