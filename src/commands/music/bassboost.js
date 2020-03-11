import Command from '../../structures/Command';
import MusicBot from '../../structures/Music';
import { config } from '../../main';

class Bassboost extends Command {
  constructor() {
    super('Bassboost');
    this.aliases = ['bassboost'];
    this.usage = 'bassboost [<nombre entre 0 et 40>]';
    this.examples = ['bassboost', 'bassboost 3'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: false });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    if (args.length === 0) return message.channel.send(this.config.currentPower.replace('%d', MusicBot.bassboost));

    let power = parseInt(args.join(' '), 10);
    if (['off', 'default', 'stop'].includes(args[0])) power = 0;

    if (isNaN(power) || power < 0 || power > 40) return message.channel.send(this.config.invalidPower);

    MusicBot.askPermission(this.bassboost, this.config.ask, message, power, this.config);
  }

  bassboost(message, arg, cmdConfig) {
    MusicBot.bassboost = arg;
    message.channel.send(cmdConfig.changed.replace('%d', arg));
  }
}

export default Bassboost;
