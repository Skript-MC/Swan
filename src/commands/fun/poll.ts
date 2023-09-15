import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  time as timeFormatter,
  TimestampStyles,
} from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import { poll as config } from '#config/commands/fun';
import * as messages from '#config/messages';
import { colors, miscellaneous } from '#config/settings';
import { Poll } from '#models/poll';
import { resolveDuration, resolveQuotedText } from '#resolvers/index';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { QuestionType } from '#types/index';
import { trimText } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class PollCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'question',
      description: 'Question du sondage',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'réponses',
      description: 'Exemple: "réponse 1" "réponse 2" "réponse 3"',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'durée',
      description: 'Durée du sondage',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'multiple',
      description: 'Peut-on répondre à plusieurs propositions ?',
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'anonyme',
      description: 'Le sondage doit-il être anonyme ?',
      required: false,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const anonymous = interaction.options.getBoolean('anonyme') ?? false;
    const multiple = interaction.options.getBoolean('multiple') ?? false;

    const duration = resolveDuration(interaction.options.getString('durée', true), false);
    if (duration.isErr()) {
      await interaction.reply(messages.prompt.duration);
      return;
    }

    const question = interaction.options.getString('question', true);

    const quotedAnswers = interaction.options.getString('réponses', true);
    const answers = resolveQuotedText(quotedAnswers);
    if (answers.isErr() || answers.unwrap().some(answer => answer.length === 0)) {
      await interaction.reply(messages.prompt.pollAnswers);
      return;
    }

    await this._exec(interaction, anonymous, multiple, question, duration.unwrap(), answers.unwrap());
  }

  // eslint-disable-next-line max-params
  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
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
          reaction: miscellaneous.pollReactions.multiple[i],
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
      formattedEnd: timeFormatter(finishDate, TimestampStyles.LongDateTime),
    });

    const member = await this.container.client.guild.members.fetch(interaction.user.id);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: pupa(embedMessages.author, { member }),
        iconURL: member.displayAvatarURL(),
      })
      .addFields(
        { name: embedMessages.question, value: trimText(question, 1000) },
        { name: embedMessages.answers, value: trimText(possibleAnswers, 1000) },
        { name: embedMessages.duration, value: durationContent },
      )
      .setTimestamp();

    if (details.length > 0)
      embed.setDescription(details.join('\n'));

    const pollMessage = await interaction.channel!.send({ embeds: [embed] });

    await interaction.reply({ content: config.messages.success, ephemeral: true });

    // Add the reactions, depending on if there are choices, or if it is a Yes/No question.
    const possibleReactions: string[] = [];
    if (questionType === QuestionType.Yesno) {
      for (const r of miscellaneous.pollReactions.yesno) {
        await pollMessage.react(r);
        possibleReactions.push(r);
      }
    } else {
      for (let i = 0; i < answers.length; i++) {
        await pollMessage.react(miscellaneous.pollReactions.multiple[i]);
        possibleReactions.push(miscellaneous.pollReactions.multiple[i]);
      }
    }

    for (const reac of miscellaneous.pollReactions.specials)
      await pollMessage.react(reac);

    embed.setColor(colors.default);
    await pollMessage.edit({ embeds: [embed] });

    // Create the objects with the votes, that has the reaction as a key, and the list of user IDs as a value.
    const votes: Record<string, string[]> = {};
    for (let i = 0; i < possibleReactions.length; i++)
      votes[possibleReactions[i]] = [];

    this.container.client.cache.pollMessagesIds.add(pollMessage.id);

    await Poll.create({
      messageId: pollMessage.id,
      memberId: member.id,
      channelId: interaction.channelId,
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
