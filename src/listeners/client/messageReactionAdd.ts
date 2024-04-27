import { Listener } from '@sapphire/framework';
import type { MessageReaction, User } from 'discord.js';
import { channels, emojis } from '#config/settings';
import { ReactionRole } from '#models/reactionRole';
import type { GuildMessage } from '#types/index';

export class MessageReactionAddListener extends Listener {
  public override async run(
    reaction: MessageReaction,
    user: User,
  ): Promise<void> {
    if (user.bot || !reaction.message.inGuild()) return;

    if (channels.idea === reaction.message.channel.id)
      await this._handleSuggestion(reaction, reaction.message, user);
    else if (
      this.container.client.cache.reactionRolesIds.has(reaction.message.id)
    )
      await this._handleReactionRole(reaction, reaction.message, user);
  }

  private async _handleSuggestion(
    reaction: MessageReaction,
    message: GuildMessage,
    user: User,
  ): Promise<void> {
    const reactionIs = (r: MessageReaction, target: string): boolean =>
      (r.emoji.id ?? r.emoji.name) === target;

    // Remove the first reaction if the user change its mind.
    if (reactionIs(reaction, emojis.yes)) {
      // If we clicked "yes" but already voted "no", then we remove the "no"
      const reactors = message.reactions.cache.find((r) =>
        reactionIs(r, emojis.no),
      )?.users;
      if (reactors?.cache.get(user.id)) await reactors.remove(user);
    } else if (reactionIs(reaction, emojis.no)) {
      // If we clicked "no" but already voted "yes", then we remove the "yes"
      const reactors = message.reactions.cache.find((r) =>
        reactionIs(r, emojis.yes),
      )?.users;
      if (reactors?.cache.get(user.id)) await reactors.remove(user);
    }
  }

  private async _handleReactionRole(
    reaction: MessageReaction,
    message: GuildMessage,
    user: User,
  ): Promise<void> {
    const document = await ReactionRole.findOne({ messageId: message.id });
    if (!document) {
      this.container.client.cache.reactionRolesIds.delete(message.id);
      return;
    }
    const emoji = document.reaction;
    if (reaction.emoji.toString() !== emoji) {
      await reaction.remove();
      return;
    }
    const givenRole = message.guild.roles.cache.get(document.givenRoleId);
    if (!givenRole) {
      this.container.logger.warn(
        `The role with id ${document.givenRoleId} does not exists !`,
      );
      return;
    }
    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      this.container.logger.warn(
        `An error has occured while trying to get member with id ${user.id}`,
      );
      return;
    }
    if (!member.roles.cache.get(givenRole.id))
      await member.roles.add(givenRole);
  }
}
