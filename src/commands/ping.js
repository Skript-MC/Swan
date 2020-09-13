import { Command } from 'discord-akairo';

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping', 'p'],
      clientPermissions: ['SEND_MESSAGES'],
    });
  }

  exec(message) {
    return message.util.send('Pong!');
  }
}

export default PingCommand;
