import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannel, MessageReaction, User } from 'discord.js';
import { MessageEmbed, Permissions } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { MoveCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { move as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class MoveCommand extends SwanCommand {
  @Arguments({
    name: 'targetedChannel',
    type: 'guildTextBasedChannel',
    match: 'pick',
    validate: (message, resolved: GuildTextBasedChannel) => {
      const isPublicChannel = resolved
        .permissionsFor(resolved.guild.roles.everyone)
        .has(Permissions.FLAGS.SEND_MESSAGES);
      return isPublicChannel && message.channel.id !== resolved.id;
    },
    required: true,
    message: messages.prompt.differentHelpChannel,
  }, {
    name: 'targetedMessage',
    type: 'message',
    match: 'pick',
    required: true,
    message: messages.prompt.message,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: MoveCommandArguments): Promise<void> {
    const hasRole = args.targetedMessage.member
      ? args.targetedMessage.member.roles.highest.position >= message.member.roles.highest.position
      : false;
    if (hasRole) {
      await message.channel.send(messages.global.memberTooPowerful);
      return;
    }

    const targetName = args.targetedMessage.member?.displayName ?? args.targetedMessage.author.username ?? 'Inconnu';
    const successMessage = pupa(config.messages.successfullyMoved, {
      targetName,
      targetChannel: args.targetedChannel,
      memberDisplayName: message.member.displayName,
    });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({
        name: pupa(config.messages.moveTitle, { targetName }),
        iconURL: args.targetedMessage.author.displayAvatarURL(),
      })
      .setDescription(
        pupa(config.messages.moveInfo, {
          memberDisplayName: message.member,
          targetName,
          sourceChannel: args.targetedMessage.channel,
          targetChannel: args.targetedChannel,
          emoji: message.guild.emojis.resolve(settings.emojis.remove) ?? settings.emojis.remove,
        }),
      );

    try {
      // Remove all messages from prompts, as well as messages from the user.
      await message.delete();
      await args.targetedMessage.delete();

      await message.channel.send(successMessage);
      const informationEmbed = await args.targetedChannel.send({ embeds: [embed] });
      await informationEmbed.react(settings.emojis.remove).catch(noop);

      const repostMessage = await args.targetedChannel.send(args.targetedMessage.content);

      const collector = informationEmbed
        .createReactionCollector({
          filter: (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === settings.emojis.remove
            && (user.id === message.author.id || user.id === args.targetedMessage.author?.id)
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
      await args.targetedMessage.member?.send(config.messages.emergency).catch(noop);
      await args.targetedMessage.member?.send(message.content).catch(noop);
      throw (unknownError as Error);
    }
  }
}
