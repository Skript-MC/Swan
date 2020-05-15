import Command from '../../structures/Command';
import MusicBot from '../../structures/Music';

class Stop extends Command {
  constructor() {
    super('Stop');
    this.aliases = ['stop', 'arrêt', 'arret'];
    this.usage = 'stop';
    this.examples = ['stop'];
    this.enabledInHelpChannels = false;
  }

  async execute(client, message, _args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: true, notRestricted: true });
    if (validate !== true) return message.channel.send(client.config.messages.errors.music[validate]);

    MusicBot.askPermission(this.stop, this.config.ask, message, _args, this.config);
  }

  stop(message, _args, cmdConfig) {
    // if (MusicBot.loop === MusicBot.enums.MUSIC) MusicBot.loop = MusicBot.enums.NONE;
    if (MusicBot.nowPlaying) {
      MusicBot.endReason = 'stop';
      MusicBot.dispatcher.end();
    }

    return message.channel.send(cmdConfig.stopped);
  }
}

export default Stop;
