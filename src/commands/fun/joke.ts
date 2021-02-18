import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import type { GuildMessage } from '@/app/types';
import type { JokeCommandArguments } from '@/app/types/CommandArguments';
import { joke as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class JokeCommand extends Command {
  constructor() {
    super('joke', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, _args: JokeCommandArguments): Promise<void> {
    const joke = config.messages.jokes[Math.floor(Math.random() * config.messages.jokes.length)];

    const embed = new MessageEmbed()
      .setTitle(`:small_blue_diamond: ${joke.split(';')[0]}`)
      .setDescription(joke.split(';')[1])
      .setColor(settings.colors.default)
      .setFooter(pupa(messages.global.executedBy, { member: message.member }))
      .setTimestamp();

    await message.channel.send(embed);
  }
}

export default JokeCommand;
