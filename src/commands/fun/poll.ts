import { Argument, Command } from 'discord-akairo';
import { MessageEmbed, Permissions } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import Poll from '@/app/models/poll';
import type { GuildMessage } from '@/app/types';
import { QuestionType, Rules } from '@/app/types';
import type { PollCommandArguments } from '@/app/types/CommandArguments';
import { trimText } from '@/app/utils';
import { poll as config } from '@/conf/commands/fun';
import settings from '@/conf/settings';

class PollCommand extends Command {
  constructor() {
    super('poll', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'duration',
        type: Argument.validate(
          'finiteDuration',
          (_message: GuildMessage, _phrase: string, value: number) => Date.now() + value > Date.now()
            && value < settings.miscellaneous.maxPollDuration,
        ),
        prompt: {
          start: config.messages.promptStartDuration,
          retry: config.messages.promptRetryDuration,
        },
      }, {
        id: 'answers',
        type: Argument.validate(
          'quotedText',
          (_message: GuildMessage, phrase: string) => phrase.length > 0 && (phrase.match(/"/gi)?.length ?? 0) % 2 === 0,
        ),
        match: 'rest',
        prompt: {
          start: config.messages.promptStartContent,
          retry: config.messages.promptRetryContent,
        },
      }, {
        id: 'anonymous',
        match: 'flag',
        flag: ['--anonymous', '--anon', '-a'],
      }, {
        id: 'multiple',
        match: 'flag',
        flag: ['--multiple', '--mult', '-m'],
      }],
      clientPermissions: Permissions.FLAGS.SEND_MESSAGES,
      userPermissions: Permissions.FLAGS.SEND_MESSAGES,
      channel: 'guild',
    });

    this.rules = Rules.NoHelpChannel;
  }

  public async exec(message: GuildMessage, args: PollCommandArguments): Promise<void> {
    // We get the question (the first quoted part amongs the answers). If there are no quotes, it will return
    // the whole string given, and args.answers will be empty.
    const question = args.answers.shift();
    // If there are no arguments given, then it is a Yes/No question, otherwise there are choices.
    const questionType = args.answers.length === 0 ? QuestionType.Yesno : QuestionType.Choice;

    const duration = args.duration * 1000;
    const finishDate = new Date(Date.now() + duration);
    const formattedEnd = moment(finishDate).format(settings.miscellaneous.durationFormat);
    const formattedDuration = moment.duration(duration).humanize();

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
      .setAuthor(pupa(embedMessages.author, { message }), message.author.avatarURL())
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
      for (let i = 0; i < args.answers.length; i++) {
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

    this.client.cache.pollMessagesIds.add(pollMessage.id);

    await Poll.create({
      messageId: pollMessage.id,
      memberId: message.author.id,
      channelId: message.channel.id,
      finish: finishDate.getTime(),
      duration,
      questionType,
      votes,
      question,
      customAnswers: args.answers.length === 0 ? null : args.answers,
      anonymous: args.anonymous,
      multiple: args.multiple,
    });
  }
}

export default PollCommand;
