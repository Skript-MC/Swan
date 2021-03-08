import { Argument, Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { Role, TextChannel } from 'discord.js';
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
          ((message: GuildMessage, _phrase: string, value: Role) => typeof value !== 'undefined' && typeof message.guild.roles.cache.get(value.id) !== 'undefined')),
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
        id: 'destinationChannel',
        type: 'textChannel',
      }],
    });
  }

  public async exec(message: GuildMessage, args: ReactionRoleCommandArguments): Promise<void> {
    const { givenRole } = args;
    let { reaction, destinationChannel } = args;
    if (!reaction || reaction.toLowerCase() === '--default')
      reaction = settings.emojis.yes;
    if (!destinationChannel)
      destinationChannel = message.channel as TextChannel;

    const embed = new MessageEmbed()
      .setTitle(pupa(config.embed.title, { givenRole }))
      .setDescription(pupa(config.embed.content, { reaction, givenRole }))
      .setColor(settings.colors.default)
      .setFooter(config.embed.footer.text, config.embed.footer.icon);

    const sendMessage = await destinationChannel.send(embed);
    try {
      void sendMessage.react(reaction);
    } catch {
      message.channel.send(messages.global.oops).catch(noop);
    }

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: givenRole.id,
      reaction,
    };

    this.client.cache.reactionRolesIds.push(document.messageId);
    await ReactionRole.create(document).catch(noop);
  }
}

export default ReactionRoleCommand;
