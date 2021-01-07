import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { GuildMember } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import { userInfo as config } from '../../../config/commands/info';
import settings from '../../../config/settings';
import type { GuildMessage } from '../../types';
import type { UserInfoCommandArguments } from '../../types/CommandArguments';

class UserInfoCommand extends Command {
  constructor() {
    super('userInfo', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'member',
        type: 'member',
        default: (message: GuildMessage): GuildMember => message.member,
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: UserInfoCommandArguments): Promise<void> {
    const embedConfig = config.messages.embed;

    let presenceDetails = '';
    const activity = args.member.presence.activities[0];
    if (activity) {
      presenceDetails = pupa(embedConfig.presence.types[activity.type.toLowerCase()], { activity });

      if (activity.details)
        presenceDetails += pupa(embedConfig.presence.details, { activity });

      if (activity.state)
        presenceDetails += pupa(embedConfig.presence.state, { activity });

      if (activity.timestamps) {
        const timestamp = moment(activity.timestamps.start).format(settings.miscellaneous.durationFormat);
        presenceDetails += pupa(embedConfig.presence.timestamps, { timestamp });
      }
    }

    const roles = args.member.roles.cache.array().filter(role => role.name !== '@everyone');

    const presenceContent = pupa(embedConfig.presence.content, {
      status: embedConfig.presence.status[args.member.presence.status],
      presenceDetails,
    });
    const namesContent = pupa(embedConfig.names.content, { member: args.member });
    const createdContent = pupa(embedConfig.created.content, {
      creation: moment(args.member.user.createdAt).format(settings.miscellaneous.durationFormat),
    });
    const joinedContent = pupa(embedConfig.joined.content, {
      joined: moment(new Date(args.member.joinedTimestamp)).format(settings.miscellaneous.durationFormat),
    });
    const rolesContent = args.member.roles.cache.size - 1 === 0
      ? embedConfig.roles.noRole
      : pupa(embedConfig.roles.content, {
        amount: args.member.roles.cache.size - 1,
        roles: roles.join(', '),
      });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(pupa(embedConfig.title, { member: args.member }))
      .setFooter(pupa(embedConfig.footer, { member: message.member }))
      .setThumbnail(args.member.user.avatarURL())
      .setTimestamp()
      .addField(embedConfig.names.title, namesContent, false)
      .addField(embedConfig.created.title, createdContent, true)
      .addField(embedConfig.joined.title, joinedContent, true)
      .addField(embedConfig.roles.title, rolesContent, false)
      .addField(embedConfig.presence.title, presenceContent, true);

    await message.util.send(embed);
  }
}

export default UserInfoCommand;
