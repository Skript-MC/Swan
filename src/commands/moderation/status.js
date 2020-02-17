import Command from '../../helpers/Command';
import { client, config } from '../../main';

class Status extends Command {
  constructor() {
    super('Status');
    this.aliases = ['status', 'statut'];
    this.usage = 'status [<on/off>]';
    this.examples = ['status', 'status off'];
    this.permissions = ['Gérant', 'Modérateur Discord'];
  }

  async execute(message, args) {
    if (args[0] === 'on') {
      client.config.activated = true;
      client.user.setActivity(config.bot.activity_on, { type: 'WATCHING' });
      message.channel.send(':white_check_mark: Vous avez bien activé le bot !');
    } else if (args[0] === 'off') {
      client.config.activated = false;
      client.user.setActivity(config.bot.activity_off, { type: 'WATCHING' });
      message.channel.send(':white_check_mark: Vous avez bien désactivé le bot !');
    } else {
      message.channel.send(this.config.status.replace('%s', client.config.activated ? 'Activé :white_check_mark:' : 'Désactivé :x:'));
    }
  }
}

export default Status;
