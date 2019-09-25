import Command from '../../components/Command';
import MusicBot from '../../music';
import { config } from '../../main';

class Join extends Command {
  constructor() {
    super('Join');
    this.aliases = ['join', 'rejoindre'];
    this.usage = 'join';
    this.examples = ['join'];
    this.activeInHelpChannels = false;
  }

  async execute(message, _args) {
    if (message.member.roles.has(config.roles.owner)) {
      message.member.voice.channel.join();
      message.channel.send(this.config.comming);
    } else if (!message.guild.voice || !message.guild.voice.connection || (message.guild.voice.connection.channel.id !== message.member.voice.channel.id && !MusicBot.nowPlaying)) {
      MusicBot.join(message);
    } else if (message.guild.voice.connection && MusicBot.nowPlaying) {
      if (message.guild.voice.connection.channel.members.size === 1) MusicBot.join(message);
      else message.channel.send(this.config.alreadyBusy.replace('%s', message.guild.voice.connection.channel.name));
    } else {
      message.channel.send(this.config.alreadyInChannel);
    }
  }
}

export default Join;
