import type { ObjectId } from 'mongoose';
import Poll from '@/app/models/poll';
import PollManager from '@/app/structures/PollManager';
import Task from '@/app/structures/Task';

class PollTask extends Task {
  constructor() {
    super('poll', {
      // Every 10 seconds
      interval: 10_000,
    });
  }

  public async exec(): Promise<void> {
    // Fetch all the poll that are expired.
    const polls = await Poll.find({
      finish: { $lte: Date.now(), $ne: -1 },
    });

    for (const poll of polls)
      await PollManager.end(this.client, poll._id as ObjectId);
  }
}

export default PollTask;
