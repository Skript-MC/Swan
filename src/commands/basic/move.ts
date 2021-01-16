import { Argument, Command } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import { move as config } from '../../../config/commands/basic';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import type { GuildMessage } from '../../types';
import type { MoveCommandArguments } from '../../types/CommandArguments';
import { noop } from '../../utils';

class MoveCommand extends Command {
  constructor() {
    super('move', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'channel',
        type: Argument.validate(
          'textChannel',
          (message, _phrase, value) => settings.channels.help.includes(message.channel.id)
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
        type: 'message',
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
    const { channel: targetedChannel, message: targetedMessage } = args;

    if (targetedMessage.member.roles.highest.position >= message.member.roles.highest.position) {
      await message.util.send(messages.global.memberTooPowerful);
      return;
    }


    const successMessage = pupa(config.messages.successfullyMoved, {
      targetDisplayName: targetedMessage.member.displayName,
      targetChannel: targetedChannel,
      memberDisplayName: message.member.displayName,
    });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(`Message de ${targetedMessage.member.displayName} :`, targetedMessage.author.avatarURL())
      .setDescription(
        pupa(config.messages.moveInfos, {
          memberDisplayName: message.member,
          targetDisplayName: targetedMessage.member,
          sourceChannel: targetedMessage.channel,
          targetChannel: targetedChannel,
          emoji: message.guild.emojis.resolve(settings.emojis.remove) || settings.emojis.remove,
        }),
      );

    try {
      // Remove all messages from prompts, as well as messages from the user.
      message.util.messages.set(message.id, message);
      message.util.messages.set(targetedMessage.id, targetedMessage);
      await message.channel.bulkDelete(message.util.messages, true);

      await message.util.send(successMessage);
      const informationEmbed = await targetedChannel.send(embed);
      const repostMessage = await targetedChannel.send(targetedMessage.content);

      const collector = informationEmbed
        .createReactionCollector(
          (r: MessageReaction, user: User) => (r.emoji.id || r.emoji.name) === settings.emojis.remove
            && (user.id === message.author.id || user.id === targetedMessage.author.id)
            && !user.bot,
          )
        .on('collect', async () => {
          try {
            collector.stop();
            await informationEmbed.delete();
            await repostMessage.delete();
          } catch {
            await message.util.send(messages.global.oops).catch(noop);
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
