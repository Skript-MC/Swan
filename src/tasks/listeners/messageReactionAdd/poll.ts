import { ApplyOptions } from '@sapphire/decorators';
import type { MessageReaction, User } from 'discord.js';
import pupa from 'pupa';
import Poll from '@/app/models/poll';
import PollManager from '@/app/structures/PollManager';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageReactionTask from '@/app/structures/tasks/listeners/MessageReactionTask';
import { QuestionType } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import { poll as config } from '@/conf/tasks/listeners/messageReactionAdd';

@ApplyOptions<TaskOptions>(config.settings)
export default class PollTask extends MessageReactionTask {
  public async runListener(reaction: MessageReaction, user: User): Promise<void> {
    if (!this.container.client.cache.pollMessagesIds.has(reaction.message.id))
      return;

    const { emoji, users } = reaction;

    const poll = await Poll.findOne({ messageId: reaction.message.id });
    if (!poll)
      return;

    const { pollReactions } = settings.miscellaneous;

    // Whether they react with the appropriate "answer reaction" for this poll
    if ((poll.questionType === QuestionType.Yesno && pollReactions.yesno.includes(emoji.name))
      || (poll.questionType === QuestionType.Choice && pollReactions.multiple.includes(emoji.name))) {
      // Find the reaction they chose before (undefined if they never answered).
      type PollAnswer = [reactionName: string, votersIds: string[]];

      const previousUserVote = Object.entries(poll.votes)
        // We find all the entries where the user id is in the votersIds array.
        .find((entry: PollAnswer) => (entry[1].includes(user.id) ? entry : null))
        // We take the reactionName if it exists.
        ?.[0];

      if (previousUserVote === emoji.name) {
        // If they already voted for this option
        const infoMessage = await reaction.message.channel.send(messages.poll.alreadyVoted);
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

      reaction.message.reactions.cache
        .filter(r => r.users.cache.has(user.id) && r.emoji.name !== emoji.name)
        .map(r => void r.users.remove(user.id).catch(noop));
      if (poll.anonymous)
        await users.remove(user);
    } else if (pollReactions.specials[1] === emoji.name && user.id === poll.memberId) {
      // If the poll's creator clicked the "Stop" button
      await PollManager.end(poll.id as string, true);
    } else if (pollReactions.specials[0] === emoji.name) {
      // If someone clicked the "Info" button
      await users.remove(user);
      const member = reaction.message.guild.members.resolve(user.id);

      try {
        if (member) {
          const text = poll.questionType === QuestionType.Yesno
            ? messages.poll.informationsYesNo
            : messages.poll.informationsCustom;
          await member.send(text);

          const infoMessage = await reaction.message.channel.send(pupa(messages.poll.dmSent, { member })).catch(nullop);
          setTimeout(async () => {
            if (infoMessage?.deletable)
              await infoMessage.delete().catch(noop);
          }, 5000);
        }
      } catch {
        await reaction.message.channel.send(pupa(messages.global.dmAreClosed, { member }));
      }
    }
  }
}
