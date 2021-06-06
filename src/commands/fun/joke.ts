import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Message from '@/app/models/message';
import type { GuildMessage } from '@/app/types';
import { MessageName } from '@/app/types';
import type { JokeCommandArguments } from '@/app/types/CommandArguments';
import { joke as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class JokeCommand extends Command {
  constructor() {
    super('joke', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'jokeName',
        type: 'string',
        match: 'content',
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: JokeCommandArguments): Promise<void> {
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
      .setFooter(pupa(messages.global.executedBy, { member: message.member }))
      .setTimestamp();

    await message.channel.send(embed);
  }
}

export default JokeCommand;
