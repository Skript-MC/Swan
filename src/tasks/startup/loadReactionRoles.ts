import { ApplyOptions } from '@sapphire/decorators';
import ReactionRole from '@/app/models/reactionRole';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import { nullop } from '@/app/utils';

@ApplyOptions<TaskOptions>({ startupOrder: 3 })
export default class LoadReactionRolesTask extends Task {
  public override async run(): Promise<void> {
    // Cache all reaction roles' messages' ids.
    const reactionRoles = await ReactionRole.find()
      .catch(nullop);
    if (reactionRoles)
      this.container.client.cache.reactionRolesIds.addAll(...reactionRoles.map(document => document.messageId));
  }
}
