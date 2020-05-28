import Command from '../../structures/Command';

class Status extends Command {
  constructor() {
    super('Status');
    this.aliases = ['status', 'statut'];
    this.usage = 'status [<on/off>]';
    this.examples = ['status', 'status off'];
    this.permissions = ['Gérant', 'Modérateur Discord'];
  }

  async execute(client, message, args) {
    if (args[0] === 'on') {
      client.activated = true; // eslint-disable-line no-param-reassign
      message.channel.send(this.config.turnOn);
    } else if (args[0] === 'off') {
      client.activated = false; // eslint-disable-line no-param-reassign
      message.channel.send(this.config.turnOff);
    } else {
      message.channel.send(this.config.status.replace('%s', client.activated ? 'Activé :white_check_mark:' : 'Désactivé :x:'));
    }
  }
}

export default Status;
