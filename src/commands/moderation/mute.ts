import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction, GuildMember } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import MuteAction from '@/app/moderation/actions/MuteAction';
import resolveDuration from '@/app/resolvers/duration';
import resolveSanctionnableMember from '@/app/resolvers/sanctionnableMember';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { mute as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class MuteCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: 'Membre à appliquer la restriction de parole',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'durée',
      description: 'Durée de la restriction',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'raison',
      description: 'Raison de la sanction (sera affichée au membre)',
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
    if (member.error) {
      await interaction.reply(messages.prompt.member);
      return;
    }

    const duration = resolveDuration(interaction.options.getString('durée'));
    if (duration.error) {
      await interaction.reply(messages.prompt.duration);
      return;
    }

    const isValid = moderator.roles.highest.id === settings.roles.forumModerator
      ? (duration.value > 0 && duration.value < settings.moderation.maximumDurationForumModerator)
      : true;
    if (!duration || !isValid) {
      await interaction.reply(messages.prompt.duration);
      return;
    }

    await this._exec(
      interaction,
      member.value,
      duration.value,
      interaction.options.getString('raison'),
    );
  }

  private async _exec(
    interaction: CommandInteraction,
    member: GuildMember,
    duration: number,
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

    if (await ModerationHelper.isBanned(member.id)) {
      await interaction.reply(messages.global.impossibleBecauseBanned).catch(noop);
      return;
    }

    try {
      const data = new ModerationData(interaction)
        .setVictim(member)
        .setReason(reason)
        .setDuration(duration * 1000, true)
        .setType(SanctionTypes.Mute);

      const success = await new MuteAction(data).commit();
      if (success)
        await interaction.reply(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while muting a member!');
      this.container.logger.info(`Duration: ${duration === -1 ? duration : duration * 1000}`);
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
