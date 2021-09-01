import { Command } from 'discord-akairo';
import type { TextChannel } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import type { GuildMessage } from '@/app/types';
import type { IdeaCommandArguments } from '@/app/types/CommandArguments';
import { idea as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class IdeaCommand extends Command {
  constructor() {
    super('idea', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, _args: IdeaCommandArguments): Promise<void> {
    const channel = this.client.cache.channels.idea as TextChannel;

    const ideas = await channel.messages.fetch().catch(console.error);
    if (!ideas) {
      await message.channel.send(config.messages.noIdeaFound);
      return;
    }

    const randomIdea = ideas.random(1)[0];

    if (!randomIdea) {
      await message.channel.send(config.messages.noIdeaFound);
      return;
    }

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(
        pupa(config.messages.ideaTitle, { name: randomIdea.member?.displayName ?? messages.global.unknownName }),
        randomIdea.author.avatarURL() ?? '',
      )
      .setDescription(randomIdea.content)
      .setFooter(pupa(messages.global.executedBy, { member: message.member }))
      .setTimestamp(randomIdea.createdAt);

    await message.channel.send(embed);
  }
}

export default IdeaCommand;
