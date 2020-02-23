import Command from '../../structures/Command';
import { client } from '../../main';

class Ping extends Command {
  constructor() {
    super('Ping');
    this.aliases = ['ping', 'ms'];
    this.usage = 'ping';
    this.examples = ['ping'];
  }

  async execute(message, _args) {
    const msg = await message.channel.send(this.config.firstMessage);
    msg.edit(this.config.secondMessage.replace('%s', msg.createdTimestamp - message.createdTimestamp).replace('%x', Math.round(client.ws.ping)));
  }
}

export default Ping;
