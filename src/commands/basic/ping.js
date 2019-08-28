import Command from '../../components/Command';

class Ping extends Command {
  constructor() {
    super('Ping');
    this.regex = /(ping|ms)/gimu;
    this.usage = 'ping';
    this.examples.push('ping');
  }

  async execute(message, _args) {
    const msg = await message.channel.send(this.config.firstMessage);
    msg.edit(this.config.secondMessage.replace('%x', msg.createdTimestamp - message.createdTimestamp));
  }
}

export default Ping;
