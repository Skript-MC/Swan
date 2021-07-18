import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { idea as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class IdeaCommand extends SwanCommand {
  public override async run(message: GuildMessage, _args: Args): Promise<void> {
    const channel = this.context.client.cache.channels.idea as TextChannel;

    const ideas = await channel.messages.fetch().catch(console.error);
    if (!ideas) {
      await message.channel.send(config.messages.noIdeaFound);
      return;
    }

    const randomIdea = ideas.random(1)[0];

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
