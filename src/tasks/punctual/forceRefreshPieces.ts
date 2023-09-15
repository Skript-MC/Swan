import { ApplyOptions } from '@sapphire/decorators';
import type { SwanClient } from '#app/SwanClient';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';

@ApplyOptions<TaskOptions>({})
export class ForceRefreshPiecesTask extends Task {
  public override async run(): Promise<void> {
    const client = this.container.client as SwanClient;
    await client.refreshPieces(true);
  }
}
