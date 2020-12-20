import { Listener } from 'discord-akairo';
import messages from '../../../config/messages';
import Logger from '../../structures/Logger';

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
        Logger.error(`Swan does not have the permission(s) ${missing.join(', ')}, which are needed for the ${command} command.`);
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
