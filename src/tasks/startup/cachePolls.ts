import { ApplyOptions } from '@sapphire/decorators';
import Poll from '@/app/models/poll';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import { noop, nullop } from '@/app/utils';
import settings from '@/conf/settings';

@ApplyOptions<TaskOptions>({ startupOrder: 7 })
export default class CachePollsTask extends Task {
  public override async run(): Promise<void> {
    const polls = await Poll.find();
    const cacheReactions = new Set([
      ...settings.miscellaneous.pollReactions.yesno,
      ...settings.miscellaneous.pollReactions.multiple,
    ]);

    for (const poll of polls) {
      const channel = this.container.client.channels.resolve(poll.channelId);
      if (!channel?.isTextBased()) {
        await Poll.findByIdAndRemove(poll._id);
        continue;
      }

      const message = await channel.messages.fetch({ message: poll.messageId, cache: true, force: true })
        .catch(nullop);
      if (!message) {
        await Poll.findByIdAndRemove(poll._id);
        continue;
      }
      for (const reaction of message.reactions.cache.values()) {
        if (cacheReactions.has(reaction.emoji.name)) {
          await reaction.users.fetch()
            .catch(noop);
        }
      }
    }
  }
}
