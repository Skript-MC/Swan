import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import type { IdeaCommandArguments } from '@/app/types/CommandArguments';
import { idea as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class IdeaCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, _args: IdeaCommandArguments): Promise<void> {
    // TODO(interactions): Add a "rerun" button. Increment the command's usage count.
    const channel = this.container.client.cache.channels.idea;

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
      .setAuthor({
        name: pupa(config.messages.ideaTitle, { name: randomIdea.member?.displayName ?? messages.global.unknownName }),
        iconURL: randomIdea.author.avatarURL() ?? '',
      })
      .setDescription(randomIdea.content)
      .setFooter({ text: pupa(messages.global.executedBy, { member: message.member }) })
      .setTimestamp(randomIdea.createdAt);

    await message.channel.send({ embeds: [embed] });
  }
}
