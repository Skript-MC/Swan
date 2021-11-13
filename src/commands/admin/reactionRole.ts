import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import ReactionRole from '@/app/models/reactionRole';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage } from '@/app/types';
import { ReactionRoleCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { reactionRole as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ReactionRoleCommand extends SwanCommand {
  @Arguments({
    name: 'givenRole',
    type: 'role',
    match: 'pick',
    required: true,
    message: messages.prompt.role,
  }, {
    name: 'reaction',
    type: 'emoji',
    match: 'pick',
    default: message => message.guild.emojis.resolve(settings.emojis.yes),
  }, {
    name: 'destinationChannel',
    type: 'guildTextBasedChannel',
    match: 'pick',
    default: message => message.channel,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: ReactionRoleCommandArguments): Promise<void> {
    const botMember = this.container.client.guild.me;
    if (!botMember || botMember.roles.highest.position <= args.givenRole.position) {
      await message.channel.send(config.messages.notEnoughPermissions).catch(noop);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(pupa(config.messages.embed.title, { givenRole: args.givenRole }))
      .setDescription(pupa(config.messages.embed.content, args))
      .setColor(settings.colors.default)
      .setFooter(config.messages.embed.footer.text, config.messages.embed.footer.icon);

    const sendMessage = await args.destinationChannel.send({ embeds: [embed] });
    try {
      await sendMessage.react(args.reaction);
    } catch {
      message.channel.send(messages.global.oops).catch(noop);
      return;
    }

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: args.givenRole.id,
      reaction: args.reaction,
    };

    this.container.client.cache.reactionRolesIds.add(document.messageId);
    await ReactionRole.create(document).catch(noop);
  }
}
