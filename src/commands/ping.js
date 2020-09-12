import { Command } from 'discord-akairo';

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping', 'p'],
    });
  }

  exec(message) {
    return message.util.send('Pong!');
  }
}

export default PingCommand;
