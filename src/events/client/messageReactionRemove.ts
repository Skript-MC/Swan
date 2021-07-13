import { Event } from '@sapphire/framework';
import type { MessageReaction, User } from 'discord.js';
import ReactionRole from '@/app/models/reactionRole';
import type { GuildMessage } from '@/app/types';
import { noop } from '@/app/utils';

export default class MessageReactionRemove extends Event {
  public async run(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot || reaction.message.channel.type === 'dm')
      return;

    const message = reaction.message as GuildMessage;
    if (this.context.client.cache.reactionRolesIds.has(message.id))
      await this._handleReactionRole(reaction, message, user);
  }

  private async _handleReactionRole(reaction: MessageReaction, message: GuildMessage, user: User): Promise<void> {
    const document = await ReactionRole.findOne({ messageId: message.id });
    if (!document)
      return;
    const emoji = document.reaction;
    if (reaction.emoji.toString() !== emoji) {
      reaction.remove().catch(noop);
      return;
    }
    const givenRole = message.guild.roles.cache.get(document.givenRoleId);
    if (!givenRole) {
      this.context.logger.warn(`The role with id ${document.givenRoleId} does not exists !`);
      return;
    }
    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      this.context.logger.warn(`An error has occured while trying to get member with id ${user.id}`);
      return;
    }
    if (member.roles.cache.get(givenRole.id))
      member.roles.remove(givenRole).catch(noop);
  }
}
