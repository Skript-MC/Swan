import { Listener } from '@sapphire/framework';
import type { MessageReaction, User } from 'discord.js';
import { channels, emojis } from '#config/settings';
import type { GuildMessage } from '#types/index';

export class MessageReactionAddListener extends Listener {
  public override async run(
    reaction: MessageReaction,
    user: User,
  ): Promise<void> {
    if (user.bot || !reaction.message.inGuild()) return;

    if (channels.idea === reaction.message.channel.id)
      await this._handleSuggestion(reaction, reaction.message, user);
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
}
