import { ApplyOptions } from '@sapphire/decorators';
import type { ObjectId } from 'mongoose';
import Poll from '@/app/models/poll';
import PollManager from '@/app/structures/PollManager';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';

@ApplyOptions<TaskOptions>({ interval: 10_000 })
export default class PollTask extends Task {
  public override async run(): Promise<void> {
    // Fetch all the poll that are expired.
    const polls = await Poll.find({
      finish: { $lte: Date.now(), $ne: -1 },
    });

    for (const poll of polls)
      await PollManager.end(poll._id as ObjectId);
  }
}
