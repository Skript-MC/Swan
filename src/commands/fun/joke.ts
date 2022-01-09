import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, MessageName } from '@/app/types';
import { JokeCommandArguments } from '@/app/types/CommandArguments';
import { joke as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class JokeCommand extends SwanCommand {
  @Arguments({
    name: 'jokeName',
    type: 'string',
    match: 'rest',
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: JokeCommandArguments): Promise<void> {
    // TODO(interactions): Add a "rerun" button. Increment the command's usage count.
    let joke;
    if (args.jokeName) {
      joke = await Message.findOne({ aliases: args.jokeName, messageType: MessageName.Joke });
    } else {
      const jokeCount = await Message.countDocuments({ messageType: MessageName.Joke });
      const random = Math.floor(Math.random() * jokeCount);
      joke = await Message.findOne({ messageType: MessageName.Joke }).skip(random);
    }

    if (!joke?.content) {
      await message.channel.send(config.messages.notFound);
      return;
    }

    const embed = new MessageEmbed()
      .setDescription(joke.content)
      .setColor(settings.colors.default)
      .setFooter({ text: pupa(messages.global.executedBy, { member: message.member }) })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}
