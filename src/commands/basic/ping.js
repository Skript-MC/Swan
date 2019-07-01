import Command from '../../components/Command';

class Ping extends Command {
  constructor() {
    super('Ping');
    this.regex = /(ping|ms)/gmui;
    this.usage = 'ping';
    this.examples.push('ping');
  }

  async execute(message, _args) {
    const msg = await message.channel.send('Ping !');
    msg.edit(`Pong ! La latence du bot est de ${msg.createdTimestamp - message.createdTimestamp}ms.`);
  }
}

export default Ping;
