import { ApplyOptions } from '@sapphire/decorators';
import { Poll } from '@/app/models/poll';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import { Task } from '@/app/structures/tasks/Task';
import { nullop } from '@/app/utils';

@ApplyOptions<TaskOptions>({ startupOrder: 1 })
export class LoadPollsTask extends Task {
  public override async run(): Promise<void> {
    // Cache all polls' messages' ids.
    const polls = await Poll.find()
      .catch(nullop);
    if (polls)
      polls.forEach(({ messageId }) => this.container.client.cache.pollMessagesIds.add(messageId));
  }
}
