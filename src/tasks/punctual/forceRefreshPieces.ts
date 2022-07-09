import { ApplyOptions } from '@sapphire/decorators';
import type SwanClient from '@/app/SwanClient';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';

@ApplyOptions<TaskOptions>({})
export default class ForceRefreshPiecesTask extends Task {
  public override async run(): Promise<void> {
    const client = this.container.client as SwanClient;
    await client.refreshPieces(true);
  }
}
