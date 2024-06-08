import { ApplyOptions } from '@sapphire/decorators';
import type { Query } from 'mongoose';
import { CommandStat } from '#models/commandStat';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';
import type { CommandStatDocument } from '#types/index';

@ApplyOptions<TaskOptions>({ startupOrder: 2 })
export class LoadCommandStatsTask extends Task {
  public override async run(): Promise<void> {
    // Add all needed commands not present in the DB, to DB.
    const commandIds = [...this.container.stores.get('commands').values()].map((cmd) => cmd.name);

    const documents: Array<Query<CommandStatDocument | null, CommandStatDocument>> = [];
    for (const commandId of commandIds)
      documents.push(CommandStat.findOneAndUpdate({ commandId }, { commandId }, { upsert: true }));

    try {
      await Promise.all(documents);
    } catch (unknownError: unknown) {
      this.container.logger.error('Could not load some documents:');
      this.container.logger.error((unknownError as Error).stack);
    }
  }
}
