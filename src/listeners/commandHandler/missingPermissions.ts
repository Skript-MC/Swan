import { Listener } from 'discord-akairo';
import type { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import pupa from 'pupa';
import Logger from '@/app/structures/Logger';
import messages from '@/conf/messages';

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
        await message.channel.send(
          pupa(messages.global.insufficientClientPermissions, {
            command,
            permissions: missing.map(perm => perm.replaceAll('_', ' ').toLowerCase()).join(', '),
          }),
        );
      }
    } else {
      await message.channel.send(messages.global.notAllowed);
    }
  }
}

export default MissingPermissionsListener;
