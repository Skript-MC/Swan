import { Listener } from 'discord-akairo';
import messages from '../../../config/messages';

class MissingPermissionsListener extends Listener {
  constructor() {
    super('missingPermissions', {
      event: 'missingPermissions',
      emitter: 'commandHandler',
    });
  }

  exec(message, command, type, missing) {
    if (type === 'client') {
      if (missing.includes('SEND_MESSAGES')) {
        this.client.logger.error(`Swan n'as pas la/les permission(s) ${missing.join(', ')}, et il en a besoin pour la commande ${command}`);
      } else {
        message.util.send(
          messages.global.insufficientClientPermissions
            .replace('{COMMAND}', command)
            .replace('{PERMISSIONS}', missing.map(perm => perm.replace(/_/g, ' ').toLowerCase()).join(', ')),
        );
      }
    } else {
      message.util.send(messages.global.notAllowed);
    }
  }
}

export default MissingPermissionsListener;
