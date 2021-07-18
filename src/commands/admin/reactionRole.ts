import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Arguments';
import ReactionRole from '@/app/models/reactionRole';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
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
    message: config.messages.promptRetry,
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
  public override async run(message: GuildMessage, args: ReactionRoleCommandArguments): Promise<void> {
    const botMember = message.guild.me;

    if (!botMember || botMember.roles.highest.position <= args.givenRole.position) {
      await message.channel.send(config.messages.notEnoughPermissions).catch(noop);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(pupa(config.embed.title, { givenRole: args.givenRole }))
      .setDescription(pupa(config.embed.content, { reaction: args.reaction, givenRole: args.givenRole }))
      .setColor(settings.colors.default)
      .setFooter(config.embed.footer.text, config.embed.footer.icon);

    const sendMessage = await args.destinationChannel.send(embed);
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
      reaction: args.reaction.toString(),
    };

    this.context.client.cache.reactionRolesIds.add(document.messageId);
    await ReactionRole.create(document).catch(noop);
  }
}
