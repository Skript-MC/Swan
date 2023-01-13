import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, GuildMember } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import resolveDuration from '@/app/resolvers/duration';
import resolveSanctionnableMember from '@/app/resolvers/sanctionnableMember';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { ban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class BanCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: 'Membre à qui appliquer le bannissement',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'durée',
      description: 'Durée du bannissement',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'raison',
      description: 'Raison du bannissement (sera affiché au membre)',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'autoban',
      description: "Automatiquement bannir le membre à la fin de la sanction s'il n'a écrit aucun message ?",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'purge',
      description: 'Supprimer les messages postés par le membre dans les 7 derniers jours ?',
      required: false,
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

    const isForumMod = moderator.roles.highest.id === settings.roles.forumModerator;

    const duration = resolveDuration(interaction.options.getString('durée', true), !isForumMod);
    if (duration.isErr()) {
      await interaction.reply(messages.prompt.duration);
      return;
    }

    const isValid = isForumMod
      ? (duration.unwrap() > 0 && duration.unwrap() < settings.moderation.maximumDurationForumModerator)
      : true;
    if (!isValid) {
      await interaction.reply(messages.prompt.forumModRestriction);
      return;
    }

    await this._exec(
      interaction,
      interaction.options.getBoolean('autoban'),
      interaction.options.getBoolean('purge'),
      member.unwrap(),
      duration.unwrap(),
      interaction.options.getString('raison', true),
    );
  }

  // eslint-disable-next-line max-params
  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    autoban: boolean,
    purge: boolean,
    member: GuildMember,
    duration: number,
    reason: string,
  ): Promise<void> {
    await interaction.deferReply();

    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.reply(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    const data = new ModerationData(interaction)
      .setVictim(member)
      .setReason(reason)
      .setShouldPurge(purge);

    if (duration === -1) {
      data.setDuration(duration, false)
        .setType(SanctionTypes.Hardban);
    } else {
      data.setDuration(duration, true)
        .setInformations({ shouldAutobanIfNoMessages: autoban })
        .setType(SanctionTypes.Ban);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await interaction.followUp(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while banning a member!');
      this.container.logger.info(`Duration: ${duration}`);
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info(`Autoban: ${autoban}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
