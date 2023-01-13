import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, GuildMember } from 'discord.js';
import { ApplicationCommandOptionType, EmbedBuilder, Formatters } from 'discord.js';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { userInfo as config } from '@/conf/commands/info';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class UserInfoCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
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
        const time = Formatters.time(activity.timestamps.start, Formatters.TimestampStyles.RelativeTime);
        presenceDetails += pupa(embedConfig.presence.timestamps, { time });
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
      creation: Formatters.time(member.user.createdAt, Formatters.TimestampStyles.LongDateTime),
    });
    const joinedContent = pupa(embedConfig.joined.content,
      member.joinedTimestamp
        ? { joined: Formatters.time(new Date(member.joinedTimestamp), Formatters.TimestampStyles.LongDateTime) }
        : { joined: messages.global.unknown(true) });
    const rolesContent = member.roles.cache.size - 1 === 0
      ? embedConfig.roles.noRole
      : pupa(embedConfig.roles.content, {
        amount: member.roles.cache.size - 1,
        roles: roles.join(', '),
      });

    const embed = new EmbedBuilder()
      .setColor(settings.colors.default)
      .setAuthor({ name: pupa(embedConfig.title, { member }) })
      .setFooter({ text: pupa(messages.global.executedBy, { member: interaction.member }) })
      .setThumbnail(member.user.displayAvatarURL())
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
