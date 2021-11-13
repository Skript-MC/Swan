import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import Poll from '@/app/models/poll';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, QuestionType } from '@/app/types';
import { PollCommandArguments } from '@/app/types/CommandArguments';
import { extractQuotedText, trimText } from '@/app/utils';
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
  @Arguments({
    name: 'anonymous',
    match: 'flag',
    flags: anonymousFlags,
  }, {
    name: 'multiple',
    match: 'flag',
    flags: multipleFlags,
  }, {
    name: 'duration',
    type: 'duration',
    match: 'pick',
    required: true,
    validate: (_message, resolved: number) => resolved >= 1000 && resolved < settings.miscellaneous.maxPollDuration,
    message: messages.prompt.duration,
  }, {
    name: 'answers',
    type: 'quotedText',
    match: 'rest',
    required: true,
    validate: (_message, resolved: string[]) => resolved[0].trimStart().length > 0,
    message: messages.prompt.pollAnswers,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: PollCommandArguments): Promise<void> {
    // We get the question (the first quoted part amongs the answers). If there are no quotes, it will return
    // the whole string given, and args.answers will be empty.
    const question = args.answers.shift()!;
    // If there are no arguments given, then it is a Yes/No question, otherwise there are choices.
    const questionType = args.answers.length === 0 ? QuestionType.Yesno : QuestionType.Choice;

    const finishDate = new Date(Date.now() + args.duration);
    const formattedEnd = moment(finishDate).format(settings.miscellaneous.durationFormat);
    const formattedDuration = moment.duration(args.duration).humanize();

    if (args.answers.length === 1) {
      await message.channel.send(config.messages.notEnoughAnswers);
      return;
    }

    if (args.answers.length > 18) {
      await message.channel.send(config.messages.tooManyAnswers);
      return;
    }

    // Show the possible answers.
    let possibleAnswers = '';
    if (questionType === QuestionType.Yesno) {
      possibleAnswers = config.messages.answersDisplayYesno;
    } else {
      for (const [i, answer] of args.answers.entries()) {
        possibleAnswers += pupa(config.messages.answersDisplayCustom, {
          reaction: settings.miscellaneous.pollReactions.multiple[i],
          answer,
        });
      }
    }

    const details: string[] = [];
    if (args.anonymous)
      details.push(config.messages.informationAnonymous);
    if (args.multiple)
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

    const pollMessage = await message.channel.send({ embeds: [embed] });

    // Add the reactions, depending on if there are choices, or if it is a Yes/No question.
    const possibleReactions: string[] = [];
    if (questionType === QuestionType.Yesno) {
      for (const r of settings.miscellaneous.pollReactions.yesno) {
        await pollMessage.react(r);
        possibleReactions.push(r);
      }
    } else {
      for (let i = 0; i < args.answers.length; i++) {
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
      duration: args.duration,
      questionType,
      votes,
      question,
      customAnswers: args.answers.length === 0 ? null : args.answers,
      anonymous: args.anonymous,
      multiple: args.multiple,
    });
  }
}
