import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { Formatters, MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import moment from 'moment';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import Poll from '@/app/models/poll';
import resolveDuration from '@/app/resolvers/duration';
import resolveQuotedText from '@/app/resolvers/quotedText';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { QuestionType } from '@/app/types';
import { trimText } from '@/app/utils';
import { poll as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class PollCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'question',
      description: 'Question du sondage',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'réponses',
      description: 'Exemple: "réponse 1" "réponse 2" "réponse 3"',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'durée',
      description: 'Durée du sondage',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.BOOLEAN,
      name: 'multiple',
      description: 'Peut-on répondre à plusieurs propositions ?',
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.BOOLEAN,
      name: 'anonyme',
      description: 'Le sondage doit-il être anonyme ?',
      required: false,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const anonymous = interaction.options.getBoolean('anonyme');

    const multiple = interaction.options.getBoolean('multiple');


    const duration = resolveDuration(interaction.options.getString('durée'));
    if (duration.error) {
      await interaction.reply(messages.prompt.duration);
      return;
    }

    const question = interaction.options.getString('question');

    const quotedAnswers = interaction.options.getString('réponses');
    const answers = resolveQuotedText(quotedAnswers);
    if (answers.error || answers.value.some(answer => answer.length === 0)) {
      await interaction.reply(messages.prompt.pollAnswers);
      return;
    }

    await this._exec(interaction, anonymous, multiple, question, duration.value, answers.value);
  }

  private async _exec(
    interaction: CommandInteraction,
    anonymous: boolean,
    multiple: boolean,
    question: string,
    duration: number,
    answers: string[],
  ): Promise<void> {
    // If there are no arguments given, then it is a Yes/No question, otherwise there are choices.
    const questionType = answers.length === 0 ? QuestionType.Yesno : QuestionType.Choice;

    if (answers.length === 1) {
      await interaction.reply(config.messages.notEnoughAnswers);
      return;
    }

    if (answers.length > 18) {
      await interaction.reply(config.messages.tooManyAnswers);
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

    const finishDate = new Date(Date.now() + duration);

    const embedMessages = config.messages.embed;
    const durationContent = pupa(embedMessages.durationContent, {
      formattedDuration: moment.duration(duration).humanize(),
      formattedEnd: Formatters.time(finishDate, Formatters.TimestampStyles.LongDateTime),
    });

    const member = await this.container.client.guild.members.fetch(interaction.member.user.id);

    const embed = new MessageEmbed()
      .setAuthor({ name: pupa(embedMessages.author, { member }), iconURL: member.avatarURL() ?? '' })
      .addField(embedMessages.question, trimText(question, 1000))
      .addField(embedMessages.answers, trimText(possibleAnswers, 1000))
      .addField(embedMessages.duration, durationContent)
      .setTimestamp();

    if (details.length > 0)
      embed.setDescription(details.join('\n'));

    const pollMessage = await interaction.channel.send({ embeds: [embed] });

    await interaction.reply({ content: config.messages.success, ephemeral: true });

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
      memberId: member.id,
      channelId: interaction.channel.id,
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
