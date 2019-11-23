import Command from '../../helpers/Command';
import MusicBot from '../../music';
import { config } from '../../main';

class ShuffleQueue extends Command {
  constructor() {
    super('Shuffle');
    this.aliases = ['shuffle', 'mix', 'melanger', 'mélanger'];
    this.usage = 'shuffle';
    this.examples = ['shuffle'];
    this.activeInHelpChannels = false;
  }

  async execute(message, _args) {
    const validate = MusicBot.canUseCommand(message, { queueNotEmpty: true, notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    MusicBot.shuffleQueue(MusicBot.queue);
    return message.channel.send(this.config.queueShuffled);
  }
}

export default ShuffleQueue;
