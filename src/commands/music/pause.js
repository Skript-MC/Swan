import Command from '../../structures/Command';
import MusicBot from '../../structures/Music';
import { config } from '../../main';

class Pause extends Command {
  constructor() {
    super('Pause');
    this.aliases = ['pause', 'resume'];
    this.usage = 'pause';
    this.examples = ['pause', 'resume'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, _args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: true, notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    MusicBot.askPermission(this.pause, 'pause/reprendre la musique', message, _args, this.config);
  }

  pause(message, _args, cmdConfig) {
    if (MusicBot.dispatcher.paused) {
      message.channel.send(cmdConfig.resumed);
      MusicBot.dispatcher.resume();
    } else {
      message.channel.send(cmdConfig.paused);
      MusicBot.dispatcher.pause();
    }
  }
}

export default Pause;
