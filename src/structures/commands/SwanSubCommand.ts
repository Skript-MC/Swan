import path from 'path';
import type { CommandOptions, PieceContext } from '@sapphire/framework';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';

interface SwanCommandOptions extends CommandOptions {
  usage: string;
  examples: string[];
}

export default abstract class SwanSubCommand extends SubCommandPluginCommand {
  usage: string;
  examples: string[];
  category: string;

  constructor(context: PieceContext, options: SwanCommandOptions) {
    super(context, options);

    this.usage = options?.usage || '';
    this.examples = options?.examples || [];

    const paths = this.path.split(path.sep);
    this.category = paths.slice(paths.indexOf('commands') + 1, -1).shift();
  }
}
