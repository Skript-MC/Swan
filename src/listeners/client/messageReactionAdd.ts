import { Listener } from 'discord-akairo';
import type { User, MessageReaction } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Poll from '../../models/poll';
import PollManager from '../../structures/PollManager';
import { QuestionType } from '../../types';

class MessageReactionAddListener extends Listener {
  constructor() {
    super('messageReactionAdd', {
      event: 'messageReactionAdd',
      emitter: 'client',
    });
  }

  public async exec(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot)
      return;

    const { message } = reaction;
    const member = message.guild.members.resolve(user.id);
    const { pollReactions } = settings.miscellaneous;

    // TODO: Cache polls in the client, to prevent doing a DB call at each reaction given.
    const poll = await Poll.findOne({ messageId: message.id });

    if (poll) {
      // Whether they react with the appropriate "answer reaction" for this poll
      if ((poll.questionType === QuestionType.Yesno
          && pollReactions.yesno.includes(reaction.emoji.name))
        || (poll.questionType === QuestionType.Choice
          && pollReactions.multiple.includes(reaction.emoji.name))) {
        // Find the reaction they choosed before (undefined if they never answered).
        type PollAnswer = [reactionName: string, votersIds: string[]];
        const previousUserVote = Object.entries(poll.votes)
          .find((entry: PollAnswer): PollAnswer => (entry[1].includes(user.id) ? entry : null))?.[0];

        if (previousUserVote === reaction.emoji.name) {
          // If they already voted for this option
          const infoMessage = await message.channel.send(messages.poll.alreadyVoted);
          await infoMessage.delete({ timeout: 5000 });
        } else if (previousUserVote) {
          // They have already voted, but they want to change
          // TODO: Support the "poll.multiple" option
          await Poll.findByIdAndUpdate(poll._id, {
            $pull: { [`votes.${previousUserVote}`]: user.id },
            $push: { [`votes.${reaction.emoji.name}`]: user.id },
          });

          if (!poll.anonymous) {
            const userReactions = message.reactions.cache.find(r => r.emoji.name === previousUserVote).users;
            if (typeof userReactions.cache.get(user.id) !== 'undefined')
              await userReactions.remove(user);
          }
        } else {
          // If they want to vote, and have never done so
          await Poll.findByIdAndUpdate(
            poll._id,
            { $push: { [`votes.${reaction.emoji.name}`]: user.id } },
          );
        }
        if (poll.anonymous)
          await reaction.users.remove(user);
      } else if (pollReactions.specials[1] === reaction.emoji.name && user.id === poll.memberId) {
        // If the poll's creator clicked the "Stop" button
        await PollManager.end(this.client, poll._id, true);
      } else if (pollReactions.specials[0] === reaction.emoji.name) {
        // If someone clicked the "Info" button
        await reaction.users.remove(user);
        try {
          const text = poll.questionType === QuestionType.Yesno
            ? messages.poll.informationsYesNo
            : messages.poll.informationsCustom;
          await member.send(text);

          const infoMessage = await message.channel.send(messages.poll.dmSent.replace('{MEMBER}', member.toString()));
          await infoMessage.delete({ timeout: 5000 });
        } catch {
          await message.reply(messages.global.dmAreClosed);
        }
      }
    }
  }
}

export default MessageReactionAddListener;
