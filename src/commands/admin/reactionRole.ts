import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction, GuildTextBasedChannel, Role, } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes, ChannelTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ReactionRole from '@/app/models/reactionRole';
import resolveEmoji from '@/app/resolvers/emoji';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { noop } from '@/app/utils';
import { reactionRole as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class ReactionRoleCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.ROLE,
      name: 'rôle',
      description: 'Rôle à distribuer via la réaction',
      required: true,
    },
    // TODO: Use the emoji type when Sapphire will release it
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'émoji',
      description: 'Émoji à utiliser',
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.CHANNEL,
      name: 'salon',
      description: 'Salon dans lequel envoyer le message',
      required: false,
      channelTypes: [ChannelTypes.GUILD_TEXT],
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const role = interaction.options.getRole('rôle');
    const givenRole = await interaction.guild.roles.fetch(role.id);

    let reaction = interaction.guild.emojis.resolve(settings.emojis.yes).toString();
    const argumentEmoji = interaction.options.getString('émoji');
    if (argumentEmoji) {
      const resolvedEmoji = resolveEmoji(interaction.options.getString('émoji'), interaction.guild);
      if (resolvedEmoji.error) {
        await interaction.reply(config.messages.invalidEmoji);
        return;
      }
      reaction = resolvedEmoji.value;
    }

    const destinationChannel = interaction.options.getChannel('salon') as GuildTextBasedChannel;

    await this._exec(
      interaction,
      givenRole,
      reaction,
      destinationChannel ?? interaction.channel as GuildTextBasedChannel,
    );
  }

  private async _exec(
    interaction: CommandInteraction,
    givenRole: Role,
    reaction: string,
    channel: GuildTextBasedChannel,
  ): Promise<void> {
    const botMember = this.container.client.guild.me;
    if (!botMember || botMember.roles.highest.position <= givenRole.position) {
      await interaction.reply(config.messages.notEnoughPermissions).catch(noop);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(pupa(config.messages.embed.title, { givenRole }))
      .setDescription(pupa(config.messages.embed.content, { reaction, givenRole }))
      .setColor(settings.colors.default)
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
