import { Listener } from 'discord-akairo';
import type { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import pupa from 'pupa';
import messages from '../../../config/messages';
import Logger from '../../structures/Logger';

class MissingPermissionsListener extends Listener {
  constructor() {
    super('missingPermissions', {
      event: 'missingPermissions',
      emitter: 'commandHandler',
    });
  }

  public async exec(message: Message, command: Command, type: string, missing: string[]): Promise<void> {
    if (type === 'client') {
      if (missing.includes('SEND_MESSAGES')) {
        Logger.error(`Swan does not have the permission(s) ${missing.join(', ')}, which are needed for the ${command} command.`);
      } else {
        await message.util.send(
          pupa(messages.global.insufficientClientPermissions, {
            command,
            permissions: missing.map(perm => perm.replace(/_/g, ' ').toLowerCase()).join(', '),
          }),
        );
      }
    } else {
      await message.util.send(messages.global.notAllowed);
    }
  }
}

export default MissingPermissionsListener;
