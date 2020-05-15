import Command from '../../structures/Command';
import MusicBot from '../../structures/Music';

class ShuffleQueue extends Command {
  constructor() {
    super('Shuffle');
    this.aliases = ['shuffle', 'mix', 'melanger', 'mélanger'];
    this.usage = 'shuffle';
    this.examples = ['shuffle'];
    this.enabledInHelpChannels = false;
  }

  async execute(client, message, _args) {
    const validate = MusicBot.canUseCommand(message, { queueNotEmpty: true, notRestricted: true });
    if (validate !== true) return message.channel.send(client.config.messages.errors.music[validate]);

    MusicBot.askPermission(this.shuffle, this.config.ask, message, _args, this.config);
  }

  shuffle(message, _args, cmdConfig) {
    MusicBot.shuffleQueue(MusicBot.queue);
    return message.channel.send(cmdConfig.queueShuffled);
  }
}

export default ShuffleQueue;
