import Command from '../../helpers/Command';
import MusicBot from '../../music';
import { config } from '../../main';

class Pause extends Command {
  constructor() {
    super('Pause');
    this.aliases = ['pause', 'resume'];
    this.usage = 'pause';
    this.examples = ['pause', 'resume'];
    this.activeInHelpChannels = false;
  }

  async execute(message, _args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: true, notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    if (MusicBot.dispatcher.paused) {
      message.channel.send(this.config.resumed);
      MusicBot.dispatcher.resume();
    } else {
      message.channel.send(this.config.paused);
      MusicBot.dispatcher.pause();
    }
  }
}

export default Pause;
