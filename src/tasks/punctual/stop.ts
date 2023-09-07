import { ApplyOptions } from '@sapphire/decorators';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';

@ApplyOptions<TaskOptions>({})
export class StopTask extends Task {
  public override run(): void {
    // eslint-disable-next-line node/no-process-exit
    process.exit(0);
  }
}
