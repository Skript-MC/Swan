import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { ApplicationCommandOptionData, CommandInteraction, MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { userInfo as config } from '@/conf/commands/info';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import { ChatInputCommand } from '@sapphire/framework';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

@ApplySwanOptions(config)
export default class UserInfoCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: 'Membre dont vous souhaitez avoir des informations',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const user = interaction.options.getUser('membre');
    const member = await this.container.client.guild.members.fetch(user.id);
    if (!member) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    await this._exec(interaction, member);
  }

  private async _exec(interaction: CommandInteraction, member: GuildMember): Promise<void> {
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
        const timestamp = moment(activity.timestamps.start).format(settings.miscellaneous.durationFormat);
        presenceDetails += pupa(embedConfig.presence.timestamps, { timestamp });
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
      creation: moment(member.user.createdAt).format(settings.miscellaneous.durationFormat),
    });
    const joinedContent = pupa(embedConfig.joined.content,
      member.joinedTimestamp
        ? { joined: moment(new Date(member.joinedTimestamp)).format(settings.miscellaneous.durationFormat) }
        : { joined: messages.global.unknown(true) });
    const rolesContent = member.roles.cache.size - 1 === 0
      ? embedConfig.roles.noRole
      : pupa(embedConfig.roles.content, {
        amount: member.roles.cache.size - 1,
        roles: roles.join(', '),
      });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({ name: pupa(embedConfig.title, { member }) })
      .setFooter({ text: pupa(messages.global.executedBy, { member: interaction.member }) })
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp()
      .addField(embedConfig.names.title, namesContent, false)
      .addField(embedConfig.created.title, createdContent, true)
      .addField(embedConfig.joined.title, joinedContent, true)
      .addField(embedConfig.roles.title, rolesContent, false)
      .addField(embedConfig.presence.title, presenceContent, true);

    await interaction.reply({ embeds: [embed] });
  }
}
