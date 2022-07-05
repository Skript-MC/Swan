import { ApplyOptions } from '@sapphire/decorators';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';

@ApplyOptions<TaskOptions>({})
export default class StopTask extends Task {
  public override run(): void {
    // eslint-disable-next-line node/no-process-exit
    process.exit(0);
  }
}
