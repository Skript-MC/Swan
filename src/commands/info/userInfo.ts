import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { Message, GuildMember } from 'discord.js';
import moment from 'moment';
import { userInfo as config } from '../../../config/commands/info';
import settings from '../../../config/settings';
import type { UserInfoCommandArguments } from '../../types/CommandArguments';

class UserInfoCommand extends Command {
  constructor() {
    super('userInfo', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'member',
        type: 'member',
        default: (message: Message): GuildMember => message.member,
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: Message, args: UserInfoCommandArguments): Promise<void> {
    const embedConfig = config.messages.embed;

    let presenceDetails = '';
    const activity = args.member.presence.activities[0];
    if (activity) {
      presenceDetails = embedConfig.presence.types[activity.type.toLowerCase()]
        .replace('{NAME}', activity.name);

      if (activity.details)
        presenceDetails += embedConfig.presence.details.replace('{DETAILS}', activity.details);

      if (activity.state)
        presenceDetails += embedConfig.presence.state.replace('{STATE}', activity.state);

      if (activity.timestamps) {
        const timestamp = moment(activity.timestamps.start).format(settings.miscellaneous.durationFormat);
        presenceDetails += embedConfig.presence.timestamps.replace('{TIMESTAMP}', timestamp);
      }
    }

    const roles = args.member.roles.cache.array().filter(role => role.name !== '@everyone');

    const presenceContent = embedConfig.presence.content
      .replace('{STATUS}', embedConfig.presence.status[args.member.presence.status])
      .replace('{DETAILS}', presenceDetails);

    const namesContent = embedConfig.names.content
      .replace('{PSEUDO}', args.member.user.username)
      .replace('{NICKNAME}', args.member.displayName)
      .replace('{DISCRIMINATOR}', args.member.user.discriminator)
      .replace('{ID}', args.member.id);

    const createdContent = embedConfig.created.content
      .replace('{CREATION}', moment(args.member.user.createdAt).format(settings.miscellaneous.durationFormat));

    const joinedContent = embedConfig.joined.content
      .replace('{JOINED}', moment(new Date(args.member.joinedTimestamp)).format(settings.miscellaneous.durationFormat));

    const rolesContent = args.member.roles.cache.size - 1 === 0
      ? embedConfig.roles.noRole
      : embedConfig.roles.content
        .replace('{AMOUNT}', (args.member.roles.cache.size - 1).toString())
        .replace('{ROLES}', roles.join(', '));

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(embedConfig.title.replace('{MEMBER}', args.member.user.username))
      .setFooter(embedConfig.footer.replace('{MEMBER}', message.author.username))
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
