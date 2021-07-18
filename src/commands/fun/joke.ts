import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { MessageName } from '@/app/types';
import { joke as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class JokeCommand extends SwanCommand {
  // [{
  //   id: 'jokeName',
  //   type: 'string',
  //   match: 'content',
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    const jokeName = await args.pickResult('string');
    let joke;
    if (jokeName.success) {
      joke = await Message.findOne({ aliases: jokeName.value, messageType: MessageName.Joke });
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
      .setFooter(pupa(messages.global.executedBy, { member: message.member }))
      .setTimestamp();

    await message.channel.send(embed);
  }
}
