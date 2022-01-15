import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction, GuildMember } from 'discord.js';
import type { ApplicationCommandTypes } from 'discord.js/typings/enums';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import resolveDuration from '@/app/resolvers/duration';
import resolveSanctionnableMember from '@/app/resolvers/sanctionnableMember';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { ban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class BanCommand extends SwanCommand {
  public static commandType: ApplicationCommandTypes.CHAT_INPUT;
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: 'Membre à appliquer le bannissement',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'durée',
      description: 'Durée du bannissement',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'raison',
      description: "Raison de l'avertissement (sera affiché au membre)",
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.BOOLEAN,
      name: 'autoban',
      description: "Automatiquement bannir le membre à la fin de la sanction s'il n'a écrit aucun message ?",
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.BOOLEAN,
      name: 'purge',
      description: 'Supprimer les messages postés par le membre dans les 7 derniers jours ?',
      required: false,
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
      interaction.options.getBoolean('autoban'),
      interaction.options.getBoolean('purge'),
      member.value,
      duration.value,
      interaction.options.getString('raison'),
    );
  }

  // eslint-disable-next-line max-params
  private async _exec(
    interaction: CommandInteraction,
    autoban: boolean,
    purge: boolean,
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

    const data = new ModerationData(interaction)
      .setVictim(member)
      .setReason(reason)
      .setShouldPurge(purge);

    if (duration === -1) {
      data.setDuration(duration, false)
        .setType(SanctionTypes.Hardban);
    } else {
      data.setDuration(duration * 1000, true)
        .setInformations({ shouldAutobanIfNoMessages: autoban })
        .setType(SanctionTypes.Ban);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await interaction.reply(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while banning a member!');
      this.container.logger.info(`Duration: ${duration === -1 ? duration : duration * 1000}`);
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info(`Autoban: ${autoban}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
