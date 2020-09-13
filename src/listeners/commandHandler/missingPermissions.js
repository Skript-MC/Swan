import { Listener } from 'discord-akairo';

class MissingPermissionsListener extends Listener {
  constructor() {
    super('missingPermissions', {
      emitter: 'commandHandler',
      event: 'missingPermissions',
      category: 'commandHandler',
    });
  }

  exec(message, command, type, missing) {
    if (type === 'client')
      this.client.logger.error(`Swan n'as pas la permission ${missing}, et il en a besoin pour la commande ${command}`);
    else
      message.util.send(this.client.messages.global.notAllowed);
  }
}

export default MissingPermissionsListener;
