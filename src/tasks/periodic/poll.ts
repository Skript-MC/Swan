import { ApplyOptions } from '@sapphire/decorators';
import { Poll } from '#models/poll';
import * as PollManager from '#structures/PollManager';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';

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
