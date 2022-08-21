import type { IMessagePrompterExplicitMessageReturn } from '@sapphire/discord.js-utilities';
import { MessagePrompter } from '@sapphire/discord.js-utilities';
import type { ContextMenuCommand } from '@sapphire/framework';
import type {
  ContextMenuInteraction,
  MessageReaction,
  TextChannel,
  User,
} from 'discord.js';
import {
  Message,
  MessageEmbed,
  Permissions,
} from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import resolveGuildTextBasedChannel from '@/app/resolvers/guildTextBasedChannel';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { noop } from '@/app/utils';
import { move as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class MoveCommand extends SwanCommand {
  public static commandType = ApplicationCommandTypes.MESSAGE;

  public override async contextMenuRun(
    interaction: ContextMenuInteraction,
    _context: ContextMenuCommand.RunContext,
  ): Promise<void> {
    const message = interaction.options.getMessage('message', true);
    if (!(message instanceof Message))
      return;
    await this._exec(interaction, message);
  }

  private async _exec(
    interaction: ContextMenuInteraction,
    targetedMessage: Message,
  ): Promise<void> {
    const member = await this.container.client.guild.members.fetch(interaction.member.user.id);

    const originalChannel = targetedMessage.channel as TextChannel;
    const canMemberWrite = originalChannel
      ?.permissionsFor(member)
      .has(Permissions.FLAGS.SEND_MESSAGES);

    if (!canMemberWrite) {
      await interaction.reply({ content: messages.prompt.channel, ephemeral: true });
      return;
    }

    const hasRole = targetedMessage.member
      ? targetedMessage.member.roles.highest.position >= member.roles.highest.position
      : false;
    if (hasRole) {
      await interaction.reply({ content: messages.global.memberTooPowerful, ephemeral: true });
      return;
    }

    await interaction.deferReply({});

    const handler = new MessagePrompter(
      config.messages.question,
      'message',
      { explicitReturn: true },
    );
    const result = await handler.run(
      interaction.channel,
      interaction.member.user as User,
    ) as IMessagePrompterExplicitMessageReturn;
    await result.appliedMessage.delete();

    const resolvedChannel = resolveGuildTextBasedChannel(result.response.content, interaction.guild);
    if (resolvedChannel.error)
      return;
    const targetedChannel = resolvedChannel.value;

    const canEveryoneWrite = targetedChannel
      ?.permissionsFor(targetedChannel.guild.roles.everyone)
      .has(Permissions.FLAGS.SEND_MESSAGES);
    const canEveryoneRead = targetedChannel
      ?.permissionsFor(targetedChannel.guild.roles.everyone)
      .has(Permissions.FLAGS.VIEW_CHANNEL);
    if (!canEveryoneWrite || !canEveryoneRead || interaction.channel.id === targetedChannel.id) {
      await interaction.followUp(messages.prompt.channel);
      return;
    }

    const targetName = targetedMessage.member?.displayName ?? targetedMessage.author.username ?? 'Inconnu';
    const successMessage = pupa(config.messages.successfullyMoved, {
      targetName,
      targetChannel: targetedChannel,
      memberDisplayName: interaction.member.user.username,
    });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({
        name: pupa(config.messages.moveTitle, { targetName }),
        iconURL: targetedMessage.author.displayAvatarURL(),
      })
      .setDescription(
        pupa(config.messages.moveInfo, {
          memberDisplayName: interaction.member,
          targetName,
          sourceChannel: targetedMessage.channel,
          targetChannel: targetedChannel,
          emoji: interaction.guild.emojis.resolve(settings.emojis.remove) ?? settings.emojis.remove,
        }),
      );

    try {
      // Remove all messages from prompts, as well as messages from the user.
      await targetedMessage.delete();
      await result.response.delete();
      await interaction.followUp(successMessage);

      const informationEmbed = await targetedChannel.send({ embeds: [embed] });
      await informationEmbed.react(settings.emojis.remove).catch(noop);

      const repostMessage = await targetedChannel.send(targetedMessage.content.slice(0, 2000));
      if (targetedMessage.content.length > 2000)
        await targetedChannel.send(targetedMessage.content.slice(2000, 4000));
      targetedMessage.attachments.forEach(async attachment => targetedChannel.send(attachment.url));

      const collector = informationEmbed
        .createReactionCollector({
          filter: (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === settings.emojis.remove
            && (user.id === interaction.user.id || user.id === targetedMessage.author?.id)
            && !user.bot,
        }).on('collect', async () => {
          try {
            collector.stop();
            await informationEmbed.delete();
            await repostMessage.delete();
          } catch {
            await interaction.followUp(messages.global.oops).catch(noop);
          }
        });
    } catch (unknownError: unknown) {
      await targetedMessage.member?.send(config.messages.emergency).catch(noop);
      await targetedMessage.member?.send(`\`${targetedMessage.content.slice(0, 2000)}\``);
      if (targetedMessage.content.length > 2000)
        await targetedMessage.member?.send(`\`${targetedMessage.content.slice(2000, 4000)}\``);
      throw (unknownError as Error);
    }
  }
}
