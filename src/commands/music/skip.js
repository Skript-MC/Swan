import Command from '../../structures/Command';
import MusicBot from '../../structures/Music';
import { config } from '../../main';

class Skip extends Command {
  constructor() {
    super('Skip');
    this.aliases = ['skip', 'next', 'passer', 'passe', 'suivant'];
    this.usage = 'skip [<nombre>]';
    this.examples = ['skip', 'skip 3'];
    this.cooldown = 3000;
    this.enabledInHelpChannels = false;
  }

  async execute(message, args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: true, queueNotEmpty: true, notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    let index;
    if (args.length > 0) {
      index = parseInt(args.join(' '), 10);
      if (isNaN(index) || MusicBot.queue.length < index) return message.channel.send(this.config.invalidIndex);
    }
    index--;

    MusicBot.askPermission(this.skip, this.config.ask, message, index, this.config);
  }

  skip(message, index, cmdConfig) {
    if (!index || index === 1) {
      message.channel.send(cmdConfig.skippedOne);
    } else {
      message.channel.send(cmdConfig.skippedSeveral.replace('%s', index));
      MusicBot.queue.splice(0, index);
    }

    if (MusicBot.loop === MusicBot.enums.MUSIC) MusicBot.loop = MusicBot.enums.NONE;
    MusicBot.endReason = 'skip';
    // On a juste à arrêter le bot, car comme il y en a encore dans la queue il va reprendre tout seul
    MusicBot.dispatcher.destroy();
  }
}

export default Skip;
