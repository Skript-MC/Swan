import Command from '../../structures/Command';
import MusicBot from '../../structures/Music';
import { config } from '../../main';

class ShuffleQueue extends Command {
  constructor() {
    super('Shuffle');
    this.aliases = ['shuffle', 'mix', 'melanger', 'mélanger'];
    this.usage = 'shuffle';
    this.examples = ['shuffle'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, _args) {
    const validate = MusicBot.canUseCommand(message, { queueNotEmpty: true, notRestricted: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    MusicBot.askPermission(this.shuffle, 'mélanger la queue', message, _args, this.config);
  }

  shuffle(message, _args, cmdConfig) {
    MusicBot.shuffleQueue(MusicBot.queue);
    return message.channel.send(cmdConfig.queueShuffled);
  }
}

export default ShuffleQueue;
