import { Argument, Command } from 'discord-akairo';
import { MessageEmbed, Permissions } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import { poll as config } from '../../../config/commands/fun';
import settings from '../../../config/settings';
import Poll from '../../models/poll';
import type { GuildMessage } from '../../types';
import { QuestionType, Rules } from '../../types';
import type { PollCommandArguments } from '../../types/CommandArguments';
import { extractQuotedText } from '../../utils';

class PollCommand extends Command {
  constructor() {
    super('poll', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'duration',
        type: Argument.validate(
          'finiteDuration',
          (_message: GuildMessage, _phrase: string, value: number) => value < settings.miscellaneous.maxPollDuration
            || Date.now() + value > Date.now(),
        ),
        prompt: {
          start: config.messages.promptStartDuration,
          retry: config.messages.promptRetryDuration,
        },
      }, {
        id: 'content',
        type: Argument.validate(
          'string',
          (_message: GuildMessage, _phrase: string, value: string) => (value.match(/"/gi)?.length ?? 0) % 2 === 0,
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

    this.rules = [Rules.NoHelpChannel];
  }

  public async exec(message: GuildMessage, args: PollCommandArguments): Promise<void> {
    // TODO: Create a custom argument type that automatically parses quoted text to an array?
    const answers = extractQuotedText(args.content);
    const question = answers.shift() || args.content;
    const questionType = answers.length === 0 ? QuestionType.Yesno : QuestionType.Choice;
    const duration = args.duration * 1000;
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

    const details = [];
    if (args.anonymous)
      details.push(config.messages.informationAnonymous);
    if (args.multiple)
      details.push(config.messages.informationMultiple);

    const embedMessages = config.messages.embed;
    const durationContent = pupa(embedMessages.durationContent, { formattedDuration, formattedEnd });

    const embed = new MessageEmbed()
      .setAuthor(pupa(embedMessages.author, { message }), message.author.avatarURL())
      .addField(embedMessages.question, question)
      .addField(embedMessages.answers, possibleAnswers)
      .addField(embedMessages.duration, durationContent)
      .setTimestamp();

    if (details.length > 0)
      embed.setDescription(details.join('\n'));

    const pollMessage = await message.channel.send(embed);

    const possibleReactions = [];
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
    await pollMessage.edit(embed);

    const votes = {};
    for (let i = 0; i < possibleReactions.length; i++)
      votes[possibleReactions[i]] = [];

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
      anonymous: args.anonymous,
      multiple: args.multiple,
    });
  }
}

export default PollCommand;
