import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { MessageReaction, User } from 'discord.js';
import { MessageEmbed, Permissions } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { move as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class MoveCommand extends SwanCommand {
  // [{
  //   id: 'channel',
  //   type: Argument.validate(
  //     'textChannel',
  //     (message, _phrase, value: GuildTextBasedChannel) => settings.channels.help.includes(message.channel.id)
  //       && settings.channels.help.includes(value.id)
  //       && message.channel.id !== value.id,
  //   ),
  //   unordered: true,
  //   prompt: {
  //     start: config.messages.startChannelPrompt,
  //     retry: config.messages.retryChannelPrompt,
  //   },
  // }, {
  //   id: 'message',
  //   type: 'channelMessage',
  //   unordered: true,
  //   prompt: {
  //     start: config.messages.startMessagePrompt,
  //     retry: config.messages.retryMessagePrompt,
  //   },
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const targetedChannel = await args.pickResult('guildTextBasedChannel');
    if (targetedChannel.error)
      return void await message.channel.send(config.messages.retryChannelPrompt);

    const isProtectedChannel = !targetedChannel.value
      .permissionsFor(targetedChannel.value.guild.roles.everyone)
      .has(Permissions.FLAGS.SEND_MESSAGES);
    if (isProtectedChannel)
      return void await message.channel.send(config.messages.retryChannelPrompt);

    const targetedMessage = await args.pickResult('message');
    if (targetedMessage.error)
      return void await message.channel.send(config.messages.retryMessagePrompt);

    if (targetedMessage.value.member.roles.highest.position >= message.member.roles.highest.position) {
      await message.channel.send(messages.global.memberTooPowerful);
      return;
    }

    const successMessage = pupa(config.messages.successfullyMoved, {
      targetDisplayName: targetedMessage.value.member.displayName,
      targetChannel: targetedChannel.value,
      memberDisplayName: message.member.displayName,
    });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(
        pupa(config.messages.moveTitle, { member: targetedMessage.value.member }),
        targetedMessage.value.author.avatarURL() ?? '',
      )
      .setDescription(
        pupa(config.messages.moveInfo, {
          memberDisplayName: message.member,
          targetDisplayName: targetedMessage.value.member,
          sourceChannel: targetedMessage.value.channel,
          targetChannel: targetedChannel.value,
          emoji: message.guild.emojis.resolve(settings.emojis.remove) ?? settings.emojis.remove,
        }),
      );

    try {
      // Remove all messages from prompts, as well as messages from the user.
      // message.util.messages.set(message.id, message);
      // message.util.messages.set(targetedMessage.id, targetedMessage);
      // await message.channel.bulkDelete(message.util.messages, true);
      await message.delete();
      await targetedMessage.value.delete();

      await message.channel.send(successMessage);
      const informationEmbed = await targetedChannel.value.send(embed);
      const repostMessage = await targetedChannel.value.send(targetedMessage.value.content);
      await informationEmbed.react(settings.emojis.remove).catch(noop);

      const collector = informationEmbed
        .createReactionCollector(
          (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === settings.emojis.remove
            && (user.id === message.author.id || user.id === targetedMessage.value.author.id)
            && !user.bot,
          )
        .on('collect', async () => {
          try {
            collector.stop();
            await informationEmbed.delete();
            await repostMessage.delete();
          } catch {
            await message.channel.send(messages.global.oops).catch(noop);
          }
        });
    } catch (unknownError: unknown) {
      await targetedMessage.value.member.send(config.messages.emergency).catch(noop);
      await targetedMessage.value.member.send(message.content).catch(noop);
      throw (unknownError as Error);
    }
  }
}
