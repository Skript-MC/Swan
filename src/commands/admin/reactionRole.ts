import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { TextChannel } from 'discord.js';
import reactionRole from '@/app/models/reactionRole';
import Logger from '@/app/structures/Logger';
import type { GuildMessage } from '@/app/types';
import type { ReactionRoleCommandArguments } from '@/app/types/CommandArguments';
import { reactionRole as config } from '@/conf/commands/admin';
import settings from '@/conf/settings';
import pupa from 'pupa';
import { noop } from '@/app/utils';

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
        type: 'role',
        prompt: {
          start: config.messages.promptStart,
          retry: config.messages.promptRetry,
        },
      },
      {
        id: 'reaction',
        type: 'string',
      },
      {
        id: 'permRole',
        type: 'role',
      },
      {
        id: 'destinationChannel',
        type: 'textChannel',
      }],
    });
  }

  public async exec(message: GuildMessage, args: ReactionRoleCommandArguments): Promise<void> {
    const { givenRole } = args;
    if (givenRole == null) {
      message.channel.send(pupa(config.messages.error, { error: "Le role saisi n\'est pas valide !" })).catch(noop);
      return;
    }
    let { reaction: emoji } = args;
    const { permRole } = args;
    let { destinationChannel: targetedChannel } = args;
    if (!emoji || emoji.toLowerCase() === '--default')
      emoji = settings.emojis.yes;
    if (!targetedChannel)
      targetedChannel = message.channel as TextChannel;

    const embed = new MessageEmbed()
      .setTitle(pupa(config.embed.title, { givenRole }))
      .setDescription(pupa(config.embed.content, {emoji, givenRole}))
      .setColor(settings.colors.default)
      .setFooter(config.embed.footer.text, config.embed.footer.icon);

    const sendMessage = await targetedChannel.send(embed);
    sendMessage.react(emoji).catch(noop);

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: givenRole.id,
      reaction: emoji,
      permissionRoleId: permRole == null ? '' : permRole.id,
    };

    this.client.cache.reactionRolesIds.push(document.messageId);
    await reactionRole.create(document).catch(noop);
  }
}

export default ReactionRoleCommand;
