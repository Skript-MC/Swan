import Command from '../../structures/Command';
import MusicBot from '../../structures/Music';

class Leave extends Command {
  constructor() {
    super('Leave');
    this.aliases = ['leave', 'quitter'];
    this.usage = 'leave';
    this.examples = ['leave'];
    this.enabledInHelpChannels = false;
  }

  async execute(client, message, _args) {
    const validate = MusicBot.canUseCommand(message, { notRestricted: true });
    if (validate !== true) return message.channel.send(client.config.messages.errors.music[validate]);

    MusicBot.askPermission(this.leave, this.config.ask, message, _args, this.config);
  }

  leave(message, _args, cmdConfig) {
    // if (MusicBot.loop === MusicBot.enums.MUSIC) MusicBot.loop = MusicBot.enums.NONE;
    if (MusicBot.nowPlaying) {
      MusicBot.endReason = 'leave';
      MusicBot.dispatcher.end();
    }
    message.guild.voice.connection.disconnect();
    message.channel.send(cmdConfig.left);
  }
}

export default Leave;
