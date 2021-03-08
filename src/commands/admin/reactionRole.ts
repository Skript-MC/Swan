import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { TextChannel } from 'discord.js';
import reactionRole from '@/app/models/reactionRole';
import Logger from '@/app/structures/Logger';
import type { GuildMessage } from '@/app/types';
import type { ReactionRoleCommandArguments } from '@/app/types/CommandArguments';
import { reactionRole as config } from '@/conf/commands/admin';
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
      message.channel.send(config.messages.error.replace('{0}', 'Le role saisi n\'est pas valide !'))
        .catch((err) => {
          Logger.error('An error has occured while trying to send message: ');
          Logger.error(err);
        });
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
      .setTitle(config.embed.title.replace('{0}', givenRole.name))
      .setDescription(config.embed.content.replace('{0}', emoji).replace('{1}', '<@&' + givenRole.id + '>'))
      .setColor(config.embed.color)
      .setFooter(config.embed.footer.text, config.embed.footer.icon);

    const sendMessage = await targetedChannel.send(embed);
    sendMessage.react(emoji)
      .catch((err) => {
        Logger.error('An error has occured while trying to send message: ');
        Logger.error(err);
      });

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: givenRole.id,
      reaction: emoji,
      permissionRoleId: permRole == null ? '' : permRole.id,
    };

    this.client.cache.reactionRolesIds.push(document.messageId);
    await reactionRole.create(document)
      .catch((err) => {
        Logger.error('An error has occured while trying to save the reaction role to the database: ');
        Logger.error(err);
      });
  }
}

export default ReactionRoleCommand;
