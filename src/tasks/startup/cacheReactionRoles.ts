import { ApplyOptions } from '@sapphire/decorators';
import { ReactionRole } from '#models/reactionRole';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';

@ApplyOptions<TaskOptions>({ startupOrder: 8 })
export class CacheReactionRolesTask extends Task {
  public override async run(): Promise<void> {
    const reactionRoles = await ReactionRole.find();
    for (const element of reactionRoles) {
      const channel = this.container.client.guild.channels.cache.get(
        element.channelId,
      );
      if (!channel?.isTextBased()) continue;

      channel.messages
        .fetch(element.messageId)
        .then((message) => {
          this.container.client.cache.reactionRolesIds.add(message.id);
        })
        .catch(async () => {
          await ReactionRole.findByIdAndDelete(element._id);
        });
    }
  }
}
