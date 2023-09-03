import type { Result } from '@sapphire/framework';
import { container, err, ok } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { SwanCommand } from '@/app/structures/commands/SwanCommand';

export function resolveCommand(parameter: string): Result<SwanCommand, 'commandError'> {
  const command = container.stores.get('commands')
    .find(cmd => cmd.name === parameter);

  if (isNullish(command))
    return err('commandError');
  return ok(command as SwanCommand);
}
