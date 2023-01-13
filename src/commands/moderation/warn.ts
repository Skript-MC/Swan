import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, GuildMember } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import WarnAction from '@/app/moderation/actions/WarnAction';
import resolveSanctionnableMember from '@/app/resolvers/sanctionnableMember';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { warn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class WarnCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: "Membre à qui appliquer l'avertissement",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'raison',
      description: "Raison de l'avertissement (sera affiché au membre)",
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const { client } = this.container;
    const victim = await client.guild.members.fetch(interaction.options.getUser('membre', true).id);
    const moderator = await client.guild.members.fetch(interaction.member.user.id);
    const member = resolveSanctionnableMember(victim, moderator);
    if (member.isErr()) {
      await interaction.reply(messages.prompt.member);
      return;
    }

    await this._exec(interaction, victim, interaction.options.getString('raison', true));
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    member: GuildMember,
    reason: string,
  ): Promise<void> {
    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.reply(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    const isBanned = await ModerationHelper.isBanned(member.id);
    if (isBanned) {
      await interaction.reply(messages.global.impossibleBecauseBanned).catch(noop);
      return;
    }

    try {
      const data = new ModerationData(interaction)
        .setVictim(member)
        .setReason(reason)
        .setDuration(settings.moderation.warnDuration * 1000, true)
        .setType(SanctionTypes.Warn);

      const success = await new WarnAction(data).commit();
      if (success)
        await interaction.reply(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while warning a member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
