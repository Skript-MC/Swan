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
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const jokeName = await args.restResult('string');

    await this._exec(message, jokeName.value);
  }

  private async _exec(message: GuildMessage, jokeName: string | null): Promise<void> {
    // TODO(interactions): Add a "rerun" button. Increment the command's usage count.
    let joke;
    if (jokeName) {
      joke = await Message.findOne({ aliases: jokeName, messageType: MessageName.Joke });
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
