import { ApplyOptions } from '@sapphire/decorators';
import type { IMessagePrompterExplicitMessageReturn } from '@sapphire/discord.js-utilities';
import { MessagePrompter } from '@sapphire/discord.js-utilities';
import type { ContextMenuCommand } from '@sapphire/framework';
import type {
  ApplicationCommandOptionData,
  Message,
  MessageReaction,
  TextChannel,
  User,
} from 'discord.js';
import {
  ApplicationCommandType,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import pupa from 'pupa';
import { move as config } from '#config/commands/basic';
import * as messages from '#config/messages';
import { colors, emojis } from '#config/settings';
import { resolveGuildTextBasedChannel } from '#resolvers/index';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { noop } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class MoveCommand extends SwanCommand {
  commandType = ApplicationCommandType.Message;
  commandOptions: ApplicationCommandOptionData[] = [];

  public override async contextMenuRun(
    interaction: SwanCommand.ContextMenuInteraction<'cached'>,
    _context: ContextMenuCommand.RunContext,
  ): Promise<void> {
    const message = interaction.options.getMessage('message', true);
    await this._exec(interaction, message);
  }

  private async _exec(
    interaction: SwanCommand.CommandInteraction<'cached'>,
    targetedMessage: Message,
  ): Promise<void> {
    const member = await this.container.client.guild.members.fetch(interaction.user.id);

    const originalChannel = targetedMessage.channel as TextChannel;
    const canMemberWrite = originalChannel
      ?.permissionsFor(member)
      .has(PermissionFlagsBits.SendMessages);

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
      interaction.channel!,
      interaction.user,
    ) as IMessagePrompterExplicitMessageReturn;
    await result.appliedMessage.delete();
    if (!result.response) {
      await interaction.followUp(messages.prompt.channel);
      return;
    }

    const resolvedChannel = resolveGuildTextBasedChannel(result.response.content, interaction.guild);
    if (resolvedChannel.isErr()) {
      await interaction.followUp(messages.prompt.channel);
      return;
    }
    const targetedChannel = resolvedChannel.unwrap();

    const canEveryoneWrite = targetedChannel
      ?.permissionsFor(targetedChannel.guild.roles.everyone)
      .has(PermissionFlagsBits.SendMessages);
    const canEveryoneRead = targetedChannel
      ?.permissionsFor(targetedChannel.guild.roles.everyone)
      .has(PermissionFlagsBits.ViewChannel);
    if (!canEveryoneWrite || !canEveryoneRead || interaction.channel!.id === targetedChannel.id) {
      await interaction.followUp(messages.prompt.channel);
      return;
    }

    const targetName = targetedMessage.member?.displayName ?? targetedMessage.author.username ?? 'Inconnu';
    const successMessage = pupa(config.messages.successfullyMoved, {
      targetName,
      targetChannel: targetedChannel,
      memberDisplayName: interaction.user.username,
    });

    const embed = new EmbedBuilder()
      .setColor(colors.default)
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
          emoji: interaction.guild.emojis.resolve(emojis.remove) ?? emojis.remove,
        }),
      );

    try {
      // Remove all messages from prompts, as well as messages from the user.
      await targetedMessage.delete();
      await result.response.delete();
      await interaction.followUp(successMessage);

      const informationEmbed = await targetedChannel.send({ embeds: [embed] });
      await informationEmbed.react(emojis.remove).catch(noop);

      const repostMessage = await targetedChannel.send(targetedMessage.content.slice(0, 2000));
      if (targetedMessage.content.length > 2000)
        await targetedChannel.send(targetedMessage.content.slice(2000, 4000));

      for (const { url } of targetedMessage.attachments.values())
        await targetedChannel.send(url);

      const collector = informationEmbed
        .createReactionCollector({
          filter: (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === emojis.remove
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
