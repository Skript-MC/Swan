import { Argument, Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { Role, TextChannel } from 'discord.js';
import * as nodeEmoji from 'node-emoji';
import pupa from 'pupa';
import ReactionRole from '@/app/models/reactionRole';
import type { GuildMessage } from '@/app/types';
import type { ReactionRoleCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { reactionRole as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class ReactionRoleCommand extends Command {
  constructor() {
    super('reactionrole', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
      args: [{
        id: 'givenRole',
        type: Argument.validate('role',
          (message: GuildMessage, _phrase: string, value: Role) => typeof message.guild.roles.cache.get(value?.id) !== 'undefined'),
        prompt: {
          start: config.messages.promptStart,
          retry: config.messages.promptRetry,
        },
      },
      {
        id: 'reaction',
        type: 'emote',
        default: settings.emojis.yes,
      },
      {
        id: 'destinationChannel',
        type: 'textChannel',
        default: (message: GuildMessage): TextChannel => message.channel as TextChannel,
      }],
    });
  }

  public async exec(message: GuildMessage, args: ReactionRoleCommandArguments): Promise<void> {
    const { givenRole } = args;
    const { reaction, destinationChannel } = args;

    const botMember = this.client.guild.members.cache.get(this.client.user.id);

    if (botMember.roles.highest.position <= givenRole.position) {
      await message.channel.send(config.messages.notEnoughPermissions).catch(noop);
      return;
    }

    const regex = /^\d+$/; // Regex to check for numbers
    const emoji = regex.test(reaction)
      ? message.guild.emojis.cache.get(reaction).toString()
      : ((reaction === settings.emojis.yes && !nodeEmoji.hasEmoji(reaction))
        ? message.guild.emojis.cache.get(reaction).toString()
        : reaction);

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
      givenRoleId: givenRole.id,
      reaction: emoji,
    };

    this.client.cache.reactionRolesIds.push(document.messageId);
    await ReactionRole.create(document).catch(noop);
  }
}

export default ReactionRoleCommand;
