import Command from '../../helpers/Command';
import MusicBot from '../../music';
import { config } from '../../main';

class Stop extends Command {
  constructor() {
    super('Stop');
    this.aliases = ['stop', 'arrêt', 'arret'];
    this.usage = 'stop';
    this.examples = ['stop'];
    this.activeInHelpChannels = false;
  }

  async execute(message, _args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: true, notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    // if (MusicBot.loop === MusicBot.enums.MUSIC) MusicBot.loop = MusicBot.enums.NONE;
    if (MusicBot.nowPlaying) {
      MusicBot.endReason = 'stop';
      MusicBot.dispatcher.end();
    }

    return message.channel.send(this.config.stopped);
  }
}

export default Stop;
