import { Argument, Command } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import type { GuildMessage, GuildTextBasedChannel } from '@/app/types';
import type { MoveCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { move as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class MoveCommand extends Command {
  constructor() {
    super('move', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'channel',
        type: Argument.validate(
          'textChannel',
          (message, _phrase, value: GuildTextBasedChannel) => settings.channels.help.includes(message.channel.id)
            && settings.channels.help.includes(value.id)
            && message.channel.id !== value.id,
        ),
        unordered: true,
        prompt: {
          start: config.messages.startChannelPrompt,
          retry: config.messages.retryChannelPrompt,
        },
      }, {
        id: 'message',
        type: 'channelMessage',
        unordered: true,
        prompt: {
          start: config.messages.startMessagePrompt,
          retry: config.messages.retryMessagePrompt,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: MoveCommandArguments): Promise<void> {
    const { channel: targetedChannel } = args;
    const targetedMessage = args.message as GuildMessage;

    if (targetedMessage.member.roles.highest.position >= message.member.roles.highest.position) {
      await message.channel.send(messages.global.memberTooPowerful);
      return;
    }

    const successMessage = pupa(config.messages.successfullyMoved, {
      targetDisplayName: targetedMessage.member.displayName,
      targetChannel: targetedChannel,
      memberDisplayName: message.member.displayName,
    });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(
        pupa(config.messages.moveTitle, { member: targetedMessage.member }),
        targetedMessage.author.avatarURL(),
      )
      .setDescription(
        pupa(config.messages.moveInfo, {
          memberDisplayName: message.member,
          targetDisplayName: targetedMessage.member,
          sourceChannel: targetedMessage.channel,
          targetChannel: targetedChannel,
          emoji: message.guild.emojis.resolve(settings.emojis.remove) ?? settings.emojis.remove,
        }),
      );

    try {
      // Remove all messages from prompts, as well as messages from the user.
      message.util.messages.set(message.id, message);
      message.util.messages.set(targetedMessage.id, targetedMessage);
      await message.channel.bulkDelete(message.util.messages, true);

      await message.channel.send(successMessage);
      const informationEmbed = await targetedChannel.send(embed);
      const repostMessage = await targetedChannel.send(targetedMessage.content);
      await informationEmbed.react(settings.emojis.remove).catch(noop);

      const collector = informationEmbed
        .createReactionCollector(
          (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === settings.emojis.remove
            && (user.id === message.author.id || user.id === targetedMessage.author.id)
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
      await targetedMessage.member.send(config.messages.emergency).catch(noop);
      await targetedMessage.member.send(message.content).catch(noop);
      throw (unknownError as Error);
    }
  }
}

export default MoveCommand;
