import Command from '../../helpers/Command';
import MusicBot from '../../helpers/music';
import { config } from '../../main';

class Loop extends Command {
  constructor() {
    super('Loop');
    this.aliases = ['loop', 'boucle', 'repeat'];
    this.usage = 'loop [music | off]';
    this.examples = ['loop', 'loop music', 'loop off'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, args) {
    const validate = MusicBot.canUseCommand(message, { notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    const reason = args.join(' ') === 'off' ? 'arrêter de ' : '';
    const arg = args.join(' ');
    if (['on', 'off'].includes(arg)) return MusicBot.askPermission(this.loop, `${reason}répéter la musique`, message, args, this.config);

    if (MusicBot.loop === MusicBot.enums.NONE) message.channel.send(this.config.noLooping);
    else if (MusicBot.loop === MusicBot.enums.MUSIC) message.channel.send(this.config.loopingMusic);
  }

  loop(message, args, cmdConfig) {
    const arg = args.join(' ');
    if (arg === 'off') {
      if (MusicBot.loop === MusicBot.enums.NONE) return message.channel.send(cmdConfig.alreadyDisabled);
      MusicBot.loop = MusicBot.enums.NONE;
      message.channel.send(cmdConfig.disabled);
    } else if (arg === 'on') {
      if (MusicBot.loop === MusicBot.enums.MUSIC) return message.channel.send(cmdConfig.alreadyEnabled);
      MusicBot.loop = MusicBot.enums.MUSIC;
      message.channel.send(cmdConfig.changed);
    }
  }
}

export default Loop;
