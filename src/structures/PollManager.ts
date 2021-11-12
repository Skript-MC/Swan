import { container } from '@sapphire/pieces';
import type { NewsChannel, TextChannel } from 'discord.js';
import type { ObjectId } from 'mongoose';
import pupa from 'pupa';
import Poll from '@/app/models/poll';
import type { PollDocument } from '@/app/types';
import { QuestionType } from '@/app/types';
import { nullop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default {
  async end(pollId: ObjectId, stopped = false): Promise<void> {
    // Remove the poll from the database and the cache.
    const poll: PollDocument | null = await Poll.findByIdAndRemove(pollId).catch(nullop);
    if (!poll)
      return;

    container.client.cache.pollMessagesIds.delete(poll.messageId);

    // Validate the channel and the message ID.
    const channel = container.client.guild.channels.resolve(poll.channelId) as NewsChannel | TextChannel;
    if (!channel)
      return;

    const message = channel?.messages?.resolve(poll.messageId)
      ?? await channel?.messages?.fetch(poll.messageId).catch(nullop);
    if (!message)
      return;

    // Compute voters, percentages and other statistics.
    const totalVoters = Object.values(poll.votes).map(elt => elt.length).reduce((acc, cur) => acc + cur);

    let results = '';
    if (poll.questionType === QuestionType.Yesno) {
      const yes = poll.votes[settings.miscellaneous.pollReactions.yesno[0]].length;
      const no = poll.votes[settings.miscellaneous.pollReactions.yesno[1]].length;
      results = pupa(messages.poll.resultYesno, {
        yes,
        no,
        percentageYes: Math.round((100 * yes) / totalVoters || 0),
        percentageNo: Math.round((100 * no) / totalVoters || 0),
      });
    } else {
      for (let i = 0; i < Object.keys(poll.votes).length; i++) {
        const reac = settings.miscellaneous.pollReactions.multiple[i];
        results += pupa(messages.poll.resultCustomLine, {
          reaction: reac,
          amount: poll.votes[reac].length,
          answer: poll.customAnswers[i],
          percentage: Math.round((100 * poll.votes[reac].length) / totalVoters || 0),
        });
      }
    }
    results += pupa(messages.poll.totalVoters, { totalVoters });

    const embed = message.embeds[0];
    embed.setColor(settings.colors.success)
      .setTitle(`${messages.poll.pollEnded} ${stopped ? messages.poll.stopped : ''}`)
      .addField(messages.poll.results, results);

    await message.reactions.removeAll();
    await message.edit({ embeds: [embed] });
  },
};
