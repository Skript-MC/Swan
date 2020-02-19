import Command from '../../helpers/Command';
import MusicBot from '../../helpers/Music';
import { config } from '../../main';

class Volume extends Command {
  constructor() {
    super('Volume');
    this.aliases = ['volume', 'vol'];
    this.usage = 'volume [<nombre entre 1 et 10>]';
    this.examples = ['volume', 'volume 3'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    if (args.length === 0) return message.channel.send(this.config.currentVolume.replace('%s', MusicBot.dispatcher.volume * 10));

    const volume = parseInt(args.join(' '), 10);
    if (isNaN(volume) || volume < 0 || volume > 10) return message.channel.send(this.config.invalidVolume);

    message.channel.send(this.config.changed.replace('%v', volume));
    return MusicBot.dispatcher.setVolume(volume / 10);
  }
}

export default Volume;
