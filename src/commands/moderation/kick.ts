import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction, GuildMember } from 'discord.js';
import type { ApplicationCommandTypes } from 'discord.js/typings/enums';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ModerationData from '@/app/moderation/ModerationData';
import KickAction from '@/app/moderation/actions/KickAction';
import resolveSanctionnableMember from '@/app/resolvers/sanctionnableMember';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { kick as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

@ApplySwanOptions(config)
export default class KickCommand extends SwanCommand {
  public static commandType: ApplicationCommandTypes.CHAT_INPUT;
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: 'Expulser le membre',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'raison',
      description: "Raison de l'expulsion",
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const { client } = this.container;
    const victim = await client.guild.members.fetch(interaction.options.getUser('membre').id);
    const moderator = await client.guild.members.fetch(interaction.member.user.id);
    const member = resolveSanctionnableMember(victim, moderator);
    if (!member.success) {
      await interaction.reply(messages.prompt.member);
      return;
    }

    await this._exec(interaction, victim, interaction.options.getString('raison'));
  }

  private async _exec(interaction: CommandInteraction, member: GuildMember, reason: string): Promise<void> {
    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.reply(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    try {
      const data = new ModerationData(interaction)
        .setVictim(member)
        .setReason(reason)
        .setType(SanctionTypes.Kick);

      const success = await new KickAction(data).commit();
      if (success)
        await interaction.reply(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while kicking a member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
