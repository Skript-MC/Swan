import { ApplyOptions } from '@sapphire/decorators';
import { ReactionRole } from '#models/reactionRole';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';
import { nullop } from '#utils/index';

@ApplyOptions<TaskOptions>({ startupOrder: 3 })
export class LoadReactionRolesTask extends Task {
  public override async run(): Promise<void> {
    // Cache all reaction roles' messages' ids.
    const reactionRoles = await ReactionRole.find()
      .catch(nullop);
    if (reactionRoles) {
      for (const { messageId } of reactionRoles)
        this.container.client.cache.reactionRolesIds.add(messageId);
    }
  }
}
