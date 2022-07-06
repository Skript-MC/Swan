import { ApplyOptions } from '@sapphire/decorators';
import Poll from '@/app/models/poll';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import { nullop } from '@/app/utils';
import { loadPolls as config } from '@/conf/tasks/startup';

@ApplyOptions<TaskOptions>(config.settings)
export default class LoadPollsTask extends Task {
  public override async run(): Promise<void> {
    // Cache all polls' messages' ids.
    const polls = await Poll.find()
      .catch(nullop);
    if (polls)
      this.container.client.cache.pollMessagesIds.addAll(...polls.map(poll => poll.messageId));
  }
}
