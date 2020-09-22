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
        this.client.logger.error(`Swan does not have the permission(s) ${missing.join(', ')}, which are needed for the ${command} command.`);
      } else {
        message.util.send(
          messages.global.insufficientClientPermissions
            .replace('{COMMAND}', command)
            // String#replaceAll is neither in NodeJS nor in babel yet...
            // eslint-disable-next-line unicorn/prefer-replace-all
            .replace('{PERMISSIONS}', missing.map(perm => perm.replace(/_/g, ' ').toLowerCase()).join(', ')),
        );
      }
    } else {
      message.util.send(messages.global.notAllowed);
    }
  }
}

export default MissingPermissionsListener;
