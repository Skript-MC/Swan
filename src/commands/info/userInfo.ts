import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { UserInfoCommandArguments } from '@/app/types/CommandArguments';
import { userInfo as config } from '@/conf/commands/info';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class UserInfoCommand extends SwanCommand {
  @Arguments({
    name: 'member',
    type: 'member',
    match: 'rest',
    default: message => message.member,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: UserInfoCommandArguments): Promise<void> {
    const embedConfig = config.messages.embed;

    let presenceDetails = '';
    const activity = args.member.presence.activities[0];
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

    const roles = [...args.member.roles.cache.values()]
      .filter(role => role.name !== '@everyone');

    const presenceContent = pupa(embedConfig.presence.content, {
      status: embedConfig.presence.status[args.member.presence.status],
      presenceDetails,
    });
    const namesContent = pupa(embedConfig.names.content, { member: args.member });
    const createdContent = pupa(embedConfig.created.content, {
      creation: moment(args.member.user.createdAt).format(settings.miscellaneous.durationFormat),
    });
    const joinedContent = pupa(embedConfig.joined.content,
      args.member.joinedTimestamp
        ? { joined: moment(new Date(args.member.joinedTimestamp)).format(settings.miscellaneous.durationFormat) }
        : { joined: messages.global.unknown(true) });
    const rolesContent = args.member.roles.cache.size - 1 === 0
      ? embedConfig.roles.noRole
      : pupa(embedConfig.roles.content, {
        amount: args.member.roles.cache.size - 1,
        roles: roles.join(', '),
      });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({ name: pupa(embedConfig.title, { member: args.member }) })
      .setFooter({ text: pupa(messages.global.executedBy, { member: message.member }) })
      .setThumbnail(args.member.user.displayAvatarURL())
      .setTimestamp()
      .addField(embedConfig.names.title, namesContent, false)
      .addField(embedConfig.created.title, createdContent, true)
      .addField(embedConfig.joined.title, joinedContent, true)
      .addField(embedConfig.roles.title, rolesContent, false)
      .addField(embedConfig.presence.title, presenceContent, true);

    await message.channel.send({ embeds: [embed] });
  }
}
