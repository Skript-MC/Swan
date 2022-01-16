import type { PieceContext } from '@sapphire/framework';
import { Command } from '@sapphire/framework';
import type { SwanCommandOptions } from '@/app/types';

export default abstract class SwanCommand extends Command {
  usage = '';
  description = '';
  examples: string[] = [];
  permissions: string[] = [];

  constructor(context: PieceContext, options: SwanCommandOptions) {
    super(context, options);

    if (options.usage)
      this.usage = options.usage;
    if (options.description)
      this.description = options.description;

    if (options.examples.length > 0)
      this.examples = options.examples;

    if (options.permissions?.length > 0)
      this.permissions = options.permissions;
  }
}
