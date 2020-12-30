import type { AkairoClient } from 'discord-akairo';
import type { TextChannel, NewsChannel } from 'discord.js';
import type { ObjectId } from 'mongoose';
import messages from '../../config/messages';
import settings from '../../config/settings';
import Poll from '../models/poll';
import { QuestionType } from '../types';

export default {
  async end(client: AkairoClient, pollId: ObjectId, stopped = false): Promise<void> {
    const poll = await Poll.findByIdAndRemove(pollId);

    const channel = client.guild.channels.resolve(poll.channelId) as TextChannel | NewsChannel;
    if (!channel)
      return;

    const message = channel?.messages?.resolve(poll.messageId) || await channel?.messages?.fetch(poll.messageId);
    if (!message)
      return;

    const totalVoters = Object.values(poll.votes).map(elt => elt.length).reduce((acc, cur) => acc + cur);

    let results = '';
    if (poll.questionType === QuestionType.Yesno) {
      const yes = poll.votes['✅'].length;
      const no = poll.votes['❌'].length;
      results = messages.poll.resultYesno
        .replace('{AMOUNT_YES}', yes.toString())
        .replace('{PERCENTAGE_YES}', Math.round((100 * yes) / totalVoters || 0).toString())
        .replace('{AMOUNT_NO}', no.toString())
        .replace('{PERCENTAGE_NO}', Math.round((100 * no) / totalVoters || 0).toString());
    } else {
      for (let i = 0; i < Object.keys(poll.votes).length; i++) {
        const reac = settings.miscellaneous.pollReactions.multiple[i];
        results += messages.poll.resultCustomLine
          .replace('{REACTION}', reac)
          .replace('{AMOUNT}', poll.votes[reac].length.toString())
          .replace('{ANSWER}', poll.customAnswers[i].toString())
          .replace('{PERCENTAGE}', Math.round((100 * poll.votes[reac].length) / totalVoters || 0).toString());
      }
    }
    results += messages.poll.totalVoters.replace('{TOTAL_VOTERS}', totalVoters.toString());

    const embed = message.embeds[0];
    embed.setColor(settings.colors.success)
      .setTitle(`${messages.poll.pollEnded} ${stopped ? messages.poll.stopped : ''}`)
      .addField(messages.poll.results, results);

    await message.reactions.removeAll();
    await message.edit(embed);
  },
};
