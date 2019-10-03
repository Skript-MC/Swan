import Command from '../../components/Command';
import MusicBot from '../../music';
import { config } from '../../main';

class Leave extends Command {
  constructor() {
    super('Leave');
    this.aliases = ['leave', 'quitter'];
    this.usage = 'leave';
    this.examples = ['leave'];
    this.activeInHelpChannels = false;
  }

  async execute(message, _args) {
    const validate = MusicBot.canUseCommand(message, { notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    // if (MusicBot.loop === MusicBot.enums.MUSIC) MusicBot.loop = MusicBot.enums.NONE;
    if (MusicBot.nowPlaying) {
      MusicBot.endReason = 'leave';
      MusicBot.dispatcher.end();
    }
    message.guild.voice.connection.disconnect();

    return message.channel.send(this.config.left);
  }
}

export default Leave;
