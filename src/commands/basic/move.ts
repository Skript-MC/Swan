import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type {
  GuildTextBasedChannel,
  Message,
  MessageReaction,
  User,
} from 'discord.js';
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
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const targetedChannel = await args.pickResult('guildTextBasedChannel').then(result => result.value);
    const isPublicChannel = targetedChannel
      ?.permissionsFor(targetedChannel.guild.roles.everyone)
      .has(Permissions.FLAGS.SEND_MESSAGES);
    if (!targetedChannel || !isPublicChannel || message.channel.id === targetedChannel.id) {
      await message.channel.send(messages.prompt.channel);
      return;
    }

    const targetedMessage = await args.pickResult('message');
    if (!targetedMessage.success) {
      await message.channel.send(messages.prompt.message);
      return;
    }

    await this._exec(message, targetedChannel, targetedMessage.value);
  }

  private async _exec(
    message: GuildMessage,
    targetedChannel: GuildTextBasedChannel,
    targetedMessage: Message,
  ): Promise<void> {
    const hasRole = targetedMessage.member
      ? targetedMessage.member.roles.highest.position >= message.member.roles.highest.position
      : false;
    if (hasRole) {
      await message.channel.send(messages.global.memberTooPowerful);
      return;
    }

    const targetName = targetedMessage.member?.displayName ?? targetedMessage.author.username ?? 'Inconnu';
    const successMessage = pupa(config.messages.successfullyMoved, {
      targetName,
      targetChannel: targetedChannel,
      memberDisplayName: message.member.displayName,
    });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({
        name: pupa(config.messages.moveTitle, { targetName }),
        iconURL: targetedMessage.author.displayAvatarURL(),
      })
      .setDescription(
        pupa(config.messages.moveInfo, {
          memberDisplayName: message.member,
          targetName,
          sourceChannel: targetedMessage.channel,
          targetChannel: targetedChannel,
          emoji: message.guild.emojis.resolve(settings.emojis.remove) ?? settings.emojis.remove,
        }),
      );

    try {
      // Remove all messages from prompts, as well as messages from the user.
      await message.delete();
      await targetedMessage.delete();

      await message.channel.send(successMessage);
      const informationEmbed = await targetedChannel.send({ embeds: [embed] });
      await informationEmbed.react(settings.emojis.remove).catch(noop);

      const repostMessage = await targetedChannel.send(targetedMessage.content);

      const collector = informationEmbed
        .createReactionCollector({
          filter: (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === settings.emojis.remove
            && (user.id === message.author.id || user.id === targetedMessage.author?.id)
            && !user.bot,
        }).on('collect', async () => {
          try {
            collector.stop();
            await informationEmbed.delete();
            await repostMessage.delete();
          } catch {
            await message.channel.send(messages.global.oops).catch(noop);
          }
        });
    } catch (unknownError: unknown) {
      await targetedMessage.member?.send(config.messages.emergency).catch(noop);
      await targetedMessage.member?.send(message.content).catch(noop);
      throw (unknownError as Error);
    }
  }
}
