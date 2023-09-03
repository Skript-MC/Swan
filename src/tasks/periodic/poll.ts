import { ApplyOptions } from '@sapphire/decorators';
import { Poll } from '@/app/models/poll';
import * as PollManager from '@/app/structures/PollManager';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import { Task } from '@/app/structures/tasks/Task';

@ApplyOptions<TaskOptions>({ interval: 10_000 })
export class PollTask extends Task {
  public override async run(): Promise<void> {
    // Fetch all the poll that are expired.
    const polls = await Poll.find({
      finish: {
        $lte: Date.now(),
        $ne: -1,
      },
    });

    for (const poll of polls)
      await PollManager.end(poll.id as string);
  }
}
