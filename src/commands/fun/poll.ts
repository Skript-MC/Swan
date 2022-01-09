import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import Poll from '@/app/models/poll';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { QuestionType } from '@/app/types';
import { trimText } from '@/app/utils';
import { poll as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

const anonymousFlags = ['a', 'anon', 'anonymous'];
const multipleFlags = ['m', 'mult', 'multiple'];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  flags: [anonymousFlags, multipleFlags].flat(),
  quotes: [],
})
export default class PollCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const anonymous = args.getFlags(...anonymousFlags);

    const multiple = args.getFlags(...multipleFlags);

    const duration = await args.pickResult('duration').then(result => result.value);
    if (!duration || duration < 1000 || duration > settings.miscellaneous.maxPollDuration) {
      await message.channel.send(messages.prompt.pollDuration);
      return;
    }

    const answers = await args.restResult('quotedText').then(result => result.value);
    if (!answers || answers.some(answer => answer.length === 0)) {
      await message.channel.send(messages.prompt.pollAnswers);
      return;
    }

    await this._exec(message, anonymous, multiple, duration, answers);
  }

  private async _exec(
    message: GuildMessage,
    anonymous: boolean,
    multiple: boolean,
    duration: number,
    answers: string[],
  ): Promise<void> {
    // We get the question (the first quoted part amongs the answers). If there are no quotes, it will return
    // the whole string given, and `answers` will be empty.
    const question = answers.shift()!;
    // If there are no arguments given, then it is a Yes/No question, otherwise there are choices.
    const questionType = answers.length === 0 ? QuestionType.Yesno : QuestionType.Choice;

    const finishDate = new Date(Date.now() + duration);
    const formattedEnd = moment(finishDate).format(settings.miscellaneous.durationFormat);
    const formattedDuration = moment.duration(duration).humanize();

    if (answers.length === 1) {
      await message.channel.send(config.messages.notEnoughAnswers);
      return;
    }

    if (answers.length > 18) {
      await message.channel.send(config.messages.tooManyAnswers);
      return;
    }

    // TODO(interactions): Add a Yes/No button for Yes/No polls, or a select-menu for multiple choices polls.
    // Show the possible answers.
    let possibleAnswers = '';
    if (questionType === QuestionType.Yesno) {
      possibleAnswers = config.messages.answersDisplayYesno;
    } else {
      for (const [i, answer] of answers.entries()) {
        possibleAnswers += pupa(config.messages.answersDisplayCustom, {
          reaction: settings.miscellaneous.pollReactions.multiple[i],
          answer,
        });
      }
    }

    const details: string[] = [];
    if (anonymous)
      details.push(config.messages.informationAnonymous);
    if (multiple)
      details.push(config.messages.informationMultiple);

    const embedMessages = config.messages.embed;
    const durationContent = pupa(embedMessages.durationContent, { formattedDuration, formattedEnd });

    const embed = new MessageEmbed()
      .setAuthor({ name: pupa(embedMessages.author, { message }), iconURL: message.author.avatarURL() ?? '' })
      .addField(embedMessages.question, trimText(question, 1000))
      .addField(embedMessages.answers, trimText(possibleAnswers, 1000))
      .addField(embedMessages.duration, durationContent)
      .setTimestamp();

    if (details.length > 0)
      embed.setDescription(details.join('\n'));

    const pollMessage = await message.channel.send({ embeds: [embed] });

    // Add the reactions, depending on if there are choices, or if it is a Yes/No question.
    const possibleReactions: string[] = [];
    if (questionType === QuestionType.Yesno) {
      for (const r of settings.miscellaneous.pollReactions.yesno) {
        await pollMessage.react(r);
        possibleReactions.push(r);
      }
    } else {
      for (let i = 0; i < answers.length; i++) {
        await pollMessage.react(settings.miscellaneous.pollReactions.multiple[i]);
        possibleReactions.push(settings.miscellaneous.pollReactions.multiple[i]);
      }
    }

    for (const reac of settings.miscellaneous.pollReactions.specials)
      await pollMessage.react(reac);

    embed.setColor(settings.colors.default);
    await pollMessage.edit({ embeds: [embed] });

    // Create the objects with the votes, that has the reaction as a key, and the list of user IDs as a value.
    const votes: Record<string, string[]> = {};
    for (let i = 0; i < possibleReactions.length; i++)
      votes[possibleReactions[i]] = [];

    this.container.client.cache.pollMessagesIds.add(pollMessage.id);

    await Poll.create({
      messageId: pollMessage.id,
      memberId: message.author.id,
      channelId: message.channel.id,
      finish: finishDate.getTime(),
      duration,
      questionType,
      votes,
      question,
      customAnswers: answers.length === 0 ? null : answers,
      anonymous,
      multiple,
    });
  }
}
