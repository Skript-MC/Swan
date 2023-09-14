import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, GuildTextBasedChannel, Role } from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import pupa from 'pupa';
import { reactionRole as config } from '#config/commands/admin';
import * as messages from '#config/messages';
import { colors, emojis } from '#config/settings';
import { ReactionRole } from '#models/reactionRole';
import { resolveEmoji } from '#resolvers/index';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { noop } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class ReactionRoleCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.Role,
      name: 'rôle',
      description: 'Rôle à distribuer via la réaction',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'émoji',
      description: 'Émoji à utiliser',
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Channel,
      name: 'salon',
      description: 'Salon dans lequel envoyer le message',
      required: false,
      channelTypes: [ChannelType.GuildText],
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction<'cached'>,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const role = interaction.options.getRole('rôle', true);
    const givenRole = await interaction.guild.roles.fetch(role.id);
    if (!givenRole) {
      await interaction.reply(config.messages.invalidRole);
      return;
    }

    let reaction = (interaction.guild.emojis.resolve(emojis.yes) ?? emojis.yes).toString();
    const argumentEmoji = interaction.options.getString('émoji');
    if (argumentEmoji) {
      const resolvedEmoji = resolveEmoji(argumentEmoji, interaction.guild);
      if (resolvedEmoji.isErr()) {
        await interaction.reply(config.messages.invalidEmoji);
        return;
      }
      reaction = resolvedEmoji.unwrap();
    }

    const destinationChannel = interaction.options.getChannel('salon')! as GuildTextBasedChannel;

    await this._exec(
      interaction,
      givenRole,
      reaction,
      destinationChannel ?? interaction.channel,
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    givenRole: Role,
    reaction: string,
    channel: GuildTextBasedChannel,
  ): Promise<void> {
    const botMember = this.container.client.guild.members.me;
    if (!botMember || botMember.roles.highest.position <= givenRole.position) {
      await interaction.reply(config.messages.notEnoughPermissions).catch(noop);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(pupa(config.messages.embed.title, { givenRole }))
      .setDescription(pupa(config.messages.embed.content, { reaction, givenRole }))
      .setColor(colors.default)
      .setFooter({ text: config.messages.embed.footer.text, iconURL: config.messages.embed.footer.icon });

    const sendMessage = await channel.send({ embeds: [embed] });
    try {
      await sendMessage.react(reaction);
    } catch {
      interaction.reply(messages.global.oops).catch(noop);
      return;
    }

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: givenRole.id,
      reaction,
    };

    this.container.client.cache.reactionRolesIds.add(document.messageId);
    await ReactionRole.create(document).catch(noop);

    await interaction.reply(config.messages.success);
  }
}
