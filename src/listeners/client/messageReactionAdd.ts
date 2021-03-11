import { Listener } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import pupa from 'pupa';
import Poll from '@/app/models/poll';
import ReactionRole from '@/app/models/reactionRole';
import Logger from '@/app/structures/Logger';
import PollManager from '@/app/structures/PollManager';
import { QuestionType } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class MessageReactionAddListener extends Listener {
  constructor() {
    super('messageReactionAdd', {
      event: 'messageReactionAdd',
      emitter: 'client',
    });
  }

  public async exec(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot || reaction.message.channel.type === 'dm')
      return;

    const message = reaction.message as GuildMessage;

    if (this.client.cache.pollMessagesIds.includes(message.id))
      await this._handlePoll(reaction, message, user);
    else if (settings.channels.suggestions === message.channel.id)
      await this._handleSuggestion(reaction, message, user);
    else if (this.client.cache.reactionRolesIds.includes(message.id))
      await this._handleReactionRole(reaction, message, user);
  }

  private async _handleSuggestion(reaction: MessageReaction, message: GuildMessage, user: User): Promise<void> {
    const reactionIs = (r: MessageReaction, target: string): boolean => (r.emoji.id ?? r.emoji.name) === target;

    // Remove the first reaction if the user change its mind.
    if (reactionIs(reaction, settings.emojis.yes)) {
      // If we clicked "yes" but already voted "no", then we remove the "no"
      const reactionners = message.reactions.cache.find(r => reactionIs(r, settings.emojis.no))?.users;
      if (reactionners?.cache.get(user.id))
        await reactionners.remove(user);
    } else if (reactionIs(reaction, settings.emojis.no)) {
      // If we clicked "no" but already voted "yes", then we remove the "yes"
      const reactionners = message.reactions.cache.find(r => reactionIs(r, settings.emojis.yes))?.users;
      if (reactionners?.cache.get(user.id))
        await reactionners.remove(user);
    }
  }

  private async _handlePoll({ emoji, users }: MessageReaction, message: GuildMessage, user: User): Promise<void> {
    const poll = await Poll.findOne({ messageId: message.id });
    if (!poll)
      return;

    const { pollReactions } = settings.miscellaneous;

    // Whether they react with the appropriate "answer reaction" for this poll
    if ((poll.questionType === QuestionType.Yesno && pollReactions.yesno.includes(emoji.name))
      || (poll.questionType === QuestionType.Choice && pollReactions.multiple.includes(emoji.name))) {
      // Find the reaction they choosed before (undefined if they never answered).
      type PollAnswer = [reactionName: string, votersIds: string[]];

      const previousUserVote: string | undefined = Object.entries(poll.votes)
        // We find all the entries where the user id is in the votersIds array.
        .find((entry: PollAnswer): PollAnswer | null => (entry[1].includes(user.id) ? entry : null))
        // We take the reactionName if it exists.
        ?.[0];

      if (previousUserVote === emoji.name) {
        // If they already voted for this option
        const infoMessage = await message.channel.send(messages.poll.alreadyVoted);
        setTimeout(async () => {
          if (infoMessage.deletable)
            await infoMessage.delete().catch(noop);
        }, 5000);
      } else if (previousUserVote) {
        // They have already voted, but they want to change
        // TODO: Support the "poll.multiple" option
        await Poll.findByIdAndUpdate(poll._id, {
          $pull: { [`votes.${previousUserVote}`]: user.id },
          $push: { [`votes.${emoji.name}`]: user.id },
        });
      } else {
        // If they want to vote, and have never done so
        await Poll.findByIdAndUpdate(
          poll._id,
          { $push: { [`votes.${emoji.name}`]: user.id } },
        );
      }

      message.reactions.cache
        .filter(r => r.users.cache.has(user.id) && r.emoji.name !== emoji.name)
        .map(r => void r.users.remove(user.id).catch(noop));
      if (poll.anonymous)
        await users.remove(user);
    } else if (pollReactions.specials[1] === emoji.name && user.id === poll.memberId) {
      // If the poll's creator clicked the "Stop" button
      await PollManager.end(this.client, poll._id, true);
    } else if (pollReactions.specials[0] === emoji.name) {
      // If someone clicked the "Info" button
      await users.remove(user);
      const member = message.guild.members.resolve(user.id);

      try {
        if (member) {
          const text = poll.questionType === QuestionType.Yesno
            ? messages.poll.informationsYesNo
            : messages.poll.informationsCustom;
          await member.send(text);

          const infoMessage = await message.channel.send(pupa(messages.poll.dmSent, { member })).catch(nullop);
          setTimeout(async () => {
            if (infoMessage?.deletable)
              await infoMessage.delete().catch(noop);
          }, 5000);
        }
      } catch {
        await message.channel.send(pupa(messages.global.dmAreClosed, { member }));
      }
    }
  }

  private async _handleReactionRole(reaction: MessageReaction, message: GuildMessage, user: User): Promise<void> {
    const document = await ReactionRole.findOne({ messageId: message.id });
    if (!document) {
      this.client.cache.reactionRolesIds = this.client.cache.reactionRolesIds.filter(element => element !== message.id);
      return;
    }
    const emoji = document.reaction;
    if (reaction.emoji.toString() !== emoji) {
      reaction.remove().catch(noop);
      return;
    }
    const givenRole = message.guild.roles.cache.get(document.givenRoleId);
    if (!givenRole) {
      Logger.warn(`The role with id ${document.givenRoleId} does not exists !`);
      return;
    }
    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      Logger.warn(`An error has occured while trying to get member with id ${user.id}`);
      return;
    }
    if (!member.roles.cache.get(givenRole.id))
      member.roles.add(givenRole).catch(noop);
  }
}

export default MessageReactionAddListener;
