import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, GuildMember } from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  time,
  TimestampStyles,
} from 'discord.js';
import pupa from 'pupa';
import { userInfo as config } from '#config/commands/info';
import * as messages from '#config/messages';
import { colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class UserInfoCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: 'Membre dont vous souhaitez avoir des informations',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const user = interaction.options.getUser('membre', true);
    const member = await this.container.client.guild.members.fetch(user.id);
    if (!member) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    await this._exec(interaction, member);
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, member: GuildMember): Promise<void> {
    const embedConfig = config.messages.embed;

    let presenceDetails = '';
    const activity = member.presence?.activities[0];
    if (activity) {
      presenceDetails = pupa(embedConfig.presence.types[activity.type], { activity });

      if (activity.details)
        presenceDetails += pupa(embedConfig.presence.details, { activity });

      if (activity.state)
        presenceDetails += pupa(embedConfig.presence.state, { activity });

      if (activity.timestamps) {
        const formattedTime = time(activity.timestamps.start, TimestampStyles.RelativeTime);
        presenceDetails += pupa(embedConfig.presence.timestamps, { time: formattedTime });
      }
    }

    const roles = [...member.roles.cache.values()]
      .filter(role => role.name !== '@everyone');

    const presenceContent = pupa(embedConfig.presence.content, {
      status: embedConfig.presence.status[member.presence?.status ?? 'offline'],
      presenceDetails,
    });
    const namesContent = pupa(embedConfig.names.content, { member });
    const createdContent = pupa(embedConfig.created.content, {
      creation: time(member.user.createdAt, TimestampStyles.LongDateTime),
    });
    const joinedContent = pupa(embedConfig.joined.content,
      member.joinedTimestamp
        ? { joined: time(new Date(member.joinedTimestamp), TimestampStyles.LongDateTime) }
        : { joined: messages.global.unknown(true) });
    const rolesContent = member.roles.cache.size - 1 === 0
      ? embedConfig.roles.noRole
      : pupa(embedConfig.roles.content, {
        amount: member.roles.cache.size - 1,
        roles: roles.join(', '),
      });

    const embed = new EmbedBuilder()
      .setColor(colors.default)
      .setAuthor({ name: pupa(embedConfig.title, { member }) })
      .setThumbnail(member.displayAvatarURL())
      .setTimestamp()
      .addFields(
        { name: embedConfig.names.title, value: namesContent, inline: false },
        { name: embedConfig.created.title, value: createdContent, inline: true },
        { name: embedConfig.joined.title, value: joinedContent, inline: true },
        { name: embedConfig.roles.title, value: rolesContent, inline: false },
        { name: embedConfig.presence.title, value: presenceContent, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  }
}
