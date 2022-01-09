import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import pupa from 'pupa';
import type SwanCommand from '@/app/structures/commands/SwanCommand';
import messages from '@/conf/messages';

export default class CommandPermissionDeniedListener extends Listener {
  public override async run(message: Message, command: SwanCommand, type: string, missing: string[]): Promise<void> {
    if (type === 'client') {
      if (missing.includes('SEND_MESSAGES')) {
        this.container.logger.error(`Swan does not have the permission(s) ${missing.join(', ')}, which are needed for the ${command.name} command.`);
      } else {
        await message.channel.send(
          pupa(messages.global.insufficientClientPermissions, {
            command,
            permissions: missing.map(perm => perm.replaceAll('_', ' ').toLowerCase()).join(', '),
          }),
        );
      }
    } else {
      await message.channel.send(messages.errors.precondition.preconditionRole);
    }
  }
}
