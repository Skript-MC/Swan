import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import ReactionRole from '@/app/models/reactionRole';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { reactionRole as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ReactionRoleCommand extends SwanCommand {
  // [{
  //   id: 'givenRole',
  //   type: Argument.validate('role',
  //     (message: GuildMessage, _phrase: string, value: Role) =>
  //        typeof message.guild.roles.cache.get(value?.id) !== 'undefined'),
  //   prompt: {
  //     start: config.messages.promptStart,
  //     retry: config.messages.promptRetry,
  //   },
  //   unordered: true,
  // },
  // {
  //   id: 'reaction',
  //   type: 'emote',
  //   default: settings.emojis.yes,
  //   unordered: true,
  // },
  // {
  //   id: 'destinationChannel',
  //   type: 'textChannel',
  //   default: (message: GuildMessage): TextChannel => message.channel as TextChannel,
  //   unordered: true,
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const givenRole = await args.pickResult('role');
    if (givenRole.error)
      return void await message.channel.send(config.messages.promptRetry);

    const emoji = (await args.pickResult('emoji'))?.value ?? message.guild.emojis.resolve(settings.emojis.yes);
    const destinationChannel = (await args.pickResult('guildTextBasedChannel'))?.value ?? message.channel;

    const botMember = message.guild.me;

    if (!botMember || botMember.roles.highest.position <= givenRole.value.position) {
      await message.channel.send(config.messages.notEnoughPermissions).catch(noop);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(pupa(config.embed.title, { givenRole }))
      .setDescription(pupa(config.embed.content, { reaction: emoji, givenRole }))
      .setColor(settings.colors.default)
      .setFooter(config.embed.footer.text, config.embed.footer.icon);

    const sendMessage = await destinationChannel.send(embed);
    try {
      await sendMessage.react(emoji);
    } catch {
      message.channel.send(messages.global.oops).catch(noop);
      return;
    }

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: givenRole.value.id,
      reaction: emoji.toString(),
    };

    this.context.client.cache.reactionRolesIds.add(document.messageId);
    await ReactionRole.create(document).catch(noop);
  }
}
