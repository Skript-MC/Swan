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
import { warn as config } from '#config/commands/moderation';
import * as messages from '#config/messages';
import { moderation } from '#config/settings';
import { ModerationData } from '#moderation/ModerationData';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { WarnAction } from '#moderation/actions/WarnAction';
import { resolveSanctionnableMember } from '#resolvers/index';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { SanctionTypes } from '#types/index';
import { nullop } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class WarnCommand extends SwanCommand {
  commandType = ApplicationCommandType.User;
  commandOptions: ApplicationCommandOptionData[] = [];

  public override async contextMenuRun(
    interaction: SwanCommand.ContextMenuInteraction<'cached'>,
    _context: ContextMenuCommand.RunContext,
  ): Promise<void> {
    const moderator = await this.container.client.guild.members.fetch(
      interaction.user.id,
    );
    const potentialVictim = await this.container.client.guild.members
      .fetch(interaction.targetId)
      .catch(nullop);
    if (!potentialVictim) {
      await interaction.reply({
        content: messages.prompt.member,
        ephemeral: true,
      });
      return;
    }

    const victim = resolveSanctionnableMember(potentialVictim, moderator);
    if (victim.isErr()) {
      await interaction.reply({
        content: messages.prompt.member,
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('warn')
      .setTitle('Avertissement');

    const reasonInput = new TextInputBuilder()
      .setLabel('Raison du bannissement')
      .setPlaceholder("Il n'était pas gentil")
      .setCustomId('reason')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      reasonInput,
    );

    modal.addComponents(firstRow);
    await interaction.showModal(modal);

    const submitInteraction = await interaction.awaitModalSubmit({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30_000,
    });

    await this._exec(
      submitInteraction,
      victim.unwrap(),
      submitInteraction.fields.getTextInputValue('reason'),
    );
  }

  private async _exec(
    interaction: SwanCommand.ModalSubmitInteraction<'cached'>,
    member: GuildMember,
    reason: string,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.followUp(messages.moderation.alreadyModerated);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    const currentBan = await ModerationHelper.getCurrentBan(member.id);
    if (currentBan) {
      await interaction.followUp(messages.global.impossibleBecauseBanned);
      return;
    }

    try {
      const data = new ModerationData(interaction)
        .setVictim({ id: member.id, name: member.displayName })
        .setReason(reason)
        .setDuration(moderation.warnDuration * 1000, true)
        .setType(SanctionTypes.Warn);

      const success = await new WarnAction(data).commit();
      if (success) await interaction.followUp(config.messages.success);
    } catch (unknownError: unknown) {
      this.container.logger.error(
        'An unexpected error occurred while warning a member!',
      );
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.followUp(messages.global.oops);
    }
  }
}
