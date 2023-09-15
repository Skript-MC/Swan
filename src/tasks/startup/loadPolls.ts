import { ApplyOptions } from '@sapphire/decorators';
import { Poll } from '#models/poll';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';
import { nullop } from '#utils/index';

@ApplyOptions<TaskOptions>({ startupOrder: 1 })
export class LoadPollsTask extends Task {
  public override async run(): Promise<void> {
    // Cache all polls' messages' ids.
    const polls = await Poll.find()
      .catch(nullop);
    if (polls) {
      for (const { messageId } of polls)
        this.container.client.cache.pollMessagesIds.add(messageId);
    }
  }
}
