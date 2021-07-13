import { ApplyOptions } from '@sapphire/decorators';
import type { Args, Result, UserError } from '@sapphire/framework';
import { err } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import Poll from '@/app/models/poll';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { QuestionType } from '@/app/types';
import { trimText } from '@/app/utils';
import { poll as config } from '@/conf/commands/fun';
import settings from '@/conf/settings';

const anonymousFlags = ['a', 'anon', 'anonymous'];
const multipleFlags = ['m', 'mult', 'multiple'];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  strategyOptions: {
    flags: [...anonymousFlags, ...multipleFlags],
  },
})
export default class PollCommand extends SwanCommand {
  // [{
  //   id: 'duration',
  //   type: Argument.validate(
  //     'finiteDuration',
  //     (_message: GuildMessage, _phrase: string, value: number) => Date.now() + value > Date.now()
  //       && value < settings.miscellaneous.maxPollDuration,
  //   ),
  //   prompt: {
  //     start: config.messages.promptStartDuration,
  //     retry: config.messages.promptRetryDuration,
  //   },
  // }, {
  //   id: 'answers',
  //   type: Argument.validate(
  //     'quotedText',
  //     (_message: GuildMessage, phrase: string) => phrase.length > 0 && (phrase.match(/"/gi)?.length ?? 0) % 2 === 0,
  //   ),
  //   match: 'rest',
  //   prompt: {
  //     start: config.messages.promptStartContent,
  //     retry: config.messages.promptRetryContent,
  //   },
  // }, {
  //   id: 'anonymous',
  //   match: 'flag',
  //   flag: ['--anonymous', '--anon', '-a'],
  // }, {
  //   id: 'multiple',
  //   match: 'flag',
  //   flag: ['--multiple', '--mult', '-m'],
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const duration = await this._getDuration(args);
    if (duration.error)
      return void await message.channel.send(config.messages.promptRetryDuration);

    const answers = await args.repeatResult('string');
    if (answers.error || answers.value[0].replace(/\s+/, '').length === 0)
      return void await message.channel.send(config.messages.promptRetryContent);

    const anonymous = args.getFlags(...anonymousFlags);
    const multiple = args.getFlags(...multipleFlags);

    // We get the question (the first quoted part amongs the answers). If there are no quotes, it will return
    // the whole string given, and answers will be empty.
    const question = answers.value.shift()!;
    // If there are no arguments given, then it is a Yes/No question, otherwise there are choices.
    const questionType = answers.value.length === 0 ? QuestionType.Yesno : QuestionType.Choice;
    const finishDate = new Date(Date.now() + duration.value);
    const formattedEnd = moment(finishDate).format(settings.miscellaneous.durationFormat);
    const formattedDuration = moment.duration(duration.value).humanize();

    if (answers.value.length === 1) {
      await message.channel.send(config.messages.notEnoughAnswers);
      return;
    }

    if (answers.value.length > 18) {
      await message.channel.send(config.messages.tooManyAnswers);
      return;
    }

    // Show the possible answers.
    let possibleAnswers = '';
    if (questionType === QuestionType.Yesno) {
      possibleAnswers = config.messages.answersDisplayYesno;
    } else {
      for (const [i, answer] of answers.value.entries()) {
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
      .setAuthor(pupa(embedMessages.author, { message }), message.author.avatarURL() ?? '')
      .addField(embedMessages.question, trimText(question, 1000))
      .addField(embedMessages.answers, trimText(possibleAnswers, 1000))
      .addField(embedMessages.duration, durationContent)
      .setTimestamp();

    if (details.length > 0)
      embed.setDescription(details.join('\n'));

    const pollMessage = await message.channel.send(embed);

    // Add the reactions, depending on if there are choices, or if it is a Yes/No question.
    const possibleReactions: string[] = [];
    if (questionType === QuestionType.Yesno) {
      for (const r of settings.miscellaneous.pollReactions.yesno) {
        await pollMessage.react(r);
        possibleReactions.push(r);
      }
    } else {
      for (let i = 0; i < answers.value.length; i++) {
        await pollMessage.react(settings.miscellaneous.pollReactions.multiple[i]);
        possibleReactions.push(settings.miscellaneous.pollReactions.multiple[i]);
      }
    }

    for (const reac of settings.miscellaneous.pollReactions.specials)
      await pollMessage.react(reac);

    embed.setColor(settings.colors.default);
    await pollMessage.edit(embed);

    // Create the objects with the votes, that has the reaction as a key, and the list of user IDs as a value.
    const votes: Record<string, string[]> = {};
    for (let i = 0; i < possibleReactions.length; i++)
      votes[possibleReactions[i]] = [];

    this.context.client.cache.pollMessagesIds.add(pollMessage.id);

    await Poll.create({
      messageId: pollMessage.id,
      memberId: message.author.id,
      channelId: message.channel.id,
      finish: finishDate.getTime(),
      duration: duration.value,
      questionType,
      votes,
      question,
      customAnswers: answers.value.length === 0 ? null : answers.value,
      anonymous,
      multiple,
    });
  }

  private async _getDuration(args: Args): Promise<Result<number, UserError>> {
    const duration = await args.pickResult('duration');

    if (duration.value < 1000 || duration.value > settings.miscellaneous.maxPollDuration) {
      const argument = this.context.stores.get('arguments').get('duration');
      return err({
        argument,
        parameter: duration.value.toString(),
        identifier: argument.name,
        name: argument.name,
        message: 'Duration exceeded your limit.',
        context: argument.context,
      });
    }

    return duration;
  }
}
