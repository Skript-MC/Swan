import type { PieceContext } from '@sapphire/framework';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';
import type { SwanCommandOptions } from '@/app/types';

export default abstract class SwanSubCommand extends SubCommandPluginCommand {
  usage: string;
  examples: string[];

  constructor(context: PieceContext, options: SwanCommandOptions) {
    super(context, options);

    this.examples = options?.examples || [];
  }
}
