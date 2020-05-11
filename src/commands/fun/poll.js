import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '../../structures/Command';
import { config } from '../../main';
import { extractQuotedText, toTimestamp } from '../../utils';

const reactions = {
  yesno: ['✅', '❌'],
  multiple: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'],
  basic: ['ℹ', '🛑'],
};

function endPoll(msg, embed, collectors, votes, answers, questionType) {
  const voters = votes.reduce((acc, cur) => acc + cur);
  let results = '';
  if (questionType === 0) {
    results = `:white_check_mark: : ${votes[0]} oui (${(100 * votes[0]) / voters || 0}%)\n:x: : ${votes[1]} non (${(100 * votes[1]) / voters || 0}%)`;
  } else if (questionType === 1) {
    for (let i = 0; i < votes.length; i++) {
      results += `${reactions.multiple[i]} : ${votes[i]} ${answers[i]} (${(100 * votes[i]) / voters || 0}%)\n`;
    }
  }
  results += `\n:bust_in_silhouette: : ${voters} votant${voters > 1 ? 's' : ''}.`;

  embed.setColor(config.colors.success)
    .setTitle('Ce vote est fini !')
    .addField('Résultats :', results);
  collectors.collector.stop();
  collectors.collectorInfo.stop();
  collectors.collectorStop.stop();
  msg.reactions.removeAll();
  msg.edit(embed);
}

class Poll extends Command {
  constructor() {
    super('Poll');
    this.aliases = ['poll', 'vote', 'sondage'];
    this.usage = 'poll <durée> "<sondage>" ["réponse 1"] ["réponse 2"] [...]';
    this.examples = ['poll 10m "votre sondage" "réponse 1" "réponse 2" "réponse 3" "réponse 4"', 'poll 10m "votre sondage"'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.invalidCmd, message.member);

    const duration = args.shift(); // Extraction de la durée
    const answers = extractQuotedText(args.join(' ')); // Array de toutes les réponses
    const question = answers.shift() || args.join(' '); // Extraction de la question
    const questionType = answers.length === 0 ? 0 : 1; // 0 = oui/non | 1 = réponse spécifique

    const wait = toTimestamp(duration) * 1000;

    if (!wait || isNaN(wait)) return message.channel.sendError(this.config.invalidDuration, message.member);
    if (Date.now() + wait < Date.now()) return message.channel.sendError(this.config.invalidDuration, message.member);
    if (wait > config.miscellaneous.maxPollDuration) return message.channel.sendError(this.config.tooLong, message.member);

    if (!question) return message.channel.sendError(this.config.invalidCmd, message.member);
    if (questionType === 1 && (args.join('').match(/"/gi).length % 2) === 1) return message.channel.sendError(this.config.quoteProblem, message.member);
    if (answers.length === 1) return message.channel.sendError(this.config.notEnoughAnswers, message.member);
    if (answers.length >= 18) return message.channel.sendError(this.config.tooManyAnswers, message.member);

    const end = moment(new Date(Date.now() + wait)).format('[le] DD/MM/YYYY [à] HH:mm:ss');

    let possibleAnswers = '';
    if (questionType === 0) {
      possibleAnswers = ':white_check_mark: Oui\n:x: Non';
    } else {
      for (let i = 0; i < answers.length; i++) {
        possibleAnswers += `${reactions.multiple[i]} ${answers[i]}\n`;
      }
    }

    const embed = new MessageEmbed()
      .setAuthor(`Vote de ${message.author.username}`, message.author.avatarURL())
      .addField('Question', question)
      .addField('Réponses possibles', possibleAnswers)
      .addField('Durée', `Ce vote dure : ${duration} (Finit ${end})`)
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();

    const msg = await message.channel.send(embed);
    if (questionType === 0) for (const r of reactions.yesno) await msg.react(r);
    else if (questionType === 1) for (let i = 0; i < answers.length; i++) await msg.react(reactions.multiple[i]);

    for (const r of reactions.basic) await msg.react(r);

    embed.setColor(config.colors.default);
    await msg.edit(embed);

    const len = questionType === 0 ? 2 : answers.length;
    const votes = new Array(len).fill(0);
    let finished = false;

    const collector = msg
      .createReactionCollector((reaction, user) => !user.bot
        && ((questionType === 0 && reactions.yesno.includes(reaction.emoji.name))
          || (questionType === 1 && reactions.multiple.includes(reaction.emoji.name))))
      .on('collect', (reaction) => {
        if (questionType === 0) votes[reactions.yesno.indexOf(reaction.emoji.name)] += 1;
        else if (questionType === 1) votes[reactions.multiple.indexOf(reaction.emoji.name)] += 1;
      });

    const collectorInfo = msg
      .createReactionCollector((reaction, user) => !user.bot
        && reaction.emoji.name === 'ℹ'
        && user.id === message.author.id)
      .on('collect', () => {
        message.channel.sendInfo(questionType === 0 ? this.config.pollInfosYesNo : this.config.pollInfosCustom, message.member);
      });

    const collectorStop = msg
      .createReactionCollector((reaction, user) => !user.bot
        && reaction.emoji.name === '🛑'
        && user.id === message.author.id)
      .once('collect', () => {
        const collectors = { collector, collectorInfo, collectorStop };
        endPoll(msg, embed, collectors, votes, answers, questionType);
        finished = true;
      });

    setTimeout(() => {
      if (finished) return;
      const collectors = { collector, collectorInfo, collectorStop };
      endPoll(msg, embed, collectors, votes, answers, questionType);
    }, wait);
  }
}

export default Poll;
