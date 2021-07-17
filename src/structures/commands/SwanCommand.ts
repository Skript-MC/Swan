import path from 'path';
import type { PieceContext } from '@sapphire/framework';
import { Command } from '@sapphire/framework';
import type { SwanCommandOptions } from '@/app/types';

export default abstract class SwanCommand extends Command {
  usage: string;
  description: string;
  examples: string[];
  category: string;
  permission: string[];

  constructor(context: PieceContext, options: SwanCommandOptions) {
    super(context, options);

    this.usage = options?.usage || '';
    this.description = options?.description || '';
    this.examples = options?.examples || [];

    const paths = this.path.split(path.sep);
    this.category = paths.slice(paths.indexOf('commands') + 1, -1).shift();
  }
}
