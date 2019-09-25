import Command from '../../components/Command';
import MusicBot from '../../music';
import { config } from '../../main';

class Loop extends Command {
  constructor() {
    super('Loop');
    this.aliases = ['loop', 'boucle', 'repeat'];
    this.usage = 'loop [music | off]';
    this.examples = ['loop', 'loop music', 'loop off'];
    this.activeInHelpChannels = false;
  }

  async execute(message, args) {
    const validate = MusicBot.canUseCommand(message, { notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    const arg = args.join(' ');
    switch (arg) {
      case 'off':
      case 'disable':
        if (MusicBot.loop === MusicBot.enums.NONE) return message.channel.send(this.config.alreadyDisabled);
        MusicBot.loop = MusicBot.enums.NONE;
        message.channel.send(this.config.disabled);
        break;
      case 'this':
      case 'current':
      case 'music':
        if (MusicBot.loop === MusicBot.enums.MUSIC) return message.channel.send(this.config.alreadyEnabled);
        MusicBot.loop = MusicBot.enums.MUSIC;
        message.channel.send(this.config.changed);
        break;
      default:
        if (MusicBot.loop === MusicBot.enums.NONE) message.channel.send(this.config.noLooping);
        else if (MusicBot.loop === MusicBot.enums.MUSIC) message.channel.send(this.config.loopingMusic);
    }
  }
}

export default Loop;
