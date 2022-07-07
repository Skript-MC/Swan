import { ApplyOptions } from '@sapphire/decorators';
import type { MessageReaction, User } from 'discord.js';
import ReactionRole from '@/app/models/reactionRole';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageReactionTask from '@/app/structures/tasks/listeners/MessageReactionTask';
import { noop } from '@/app/utils';
import { reactionRole as config } from '@/conf/tasks/listeners/messageReactionAdd';

@ApplyOptions<TaskOptions>(config.settings)
export default class ReactionRoleTask extends MessageReactionTask {
  public async runListener(reaction: MessageReaction, user: User): Promise<void> {
    if (!this.container.client.cache.reactionRolesIds.has(reaction.message.id))
      return;

    const document = await ReactionRole.findOne({ messageId: reaction.message.id });
    if (!document) {
      this.container.client.cache.reactionRolesIds.delete(reaction.message.id);
      return;
    }
    const emoji = document.reaction;
    if (reaction.emoji.toString() !== emoji) {
      reaction.remove().catch(noop);
      return;
    }
    const givenRole = reaction.message.guild.roles.cache.get(document.givenRoleId);
    if (!givenRole) {
      this.container.logger.warn(`The role with id ${document.givenRoleId} does not exists !`);
      return;
    }
    const member = reaction.message.guild.members.cache.get(user.id);
    if (!member) {
      this.container.logger.warn(`An error has occured while trying to get member with id ${user.id}`);
      return;
    }
    if (!member.roles.cache.get(givenRole.id))
      member.roles.add(givenRole).catch(noop);
  }
}
