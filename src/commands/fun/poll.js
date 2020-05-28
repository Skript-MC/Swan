import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '../../structures/Command';
import { extractQuotedText, toTimestamp } from '../../utils';
import { db } from '../../main';

const reactions = {
  yesno: ['✅', '❌'],
  multiple: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'],
  basic: ['ℹ', '🛑'],
};

export async function endPoll(client, poll, stopped = false) {
  await db.polls.remove({ id: poll.id });
  const voters = Object.values(poll.votes).map(elt => elt.length).reduce((acc, cur) => acc + cur);

  let results = '';
  if (poll.type === 0) {
    const yes = poll.votes['✅'].length;
    const no = poll.votes['❌'].length;
    results = `:white_check_mark: : ${yes} oui (${Math.round((100 * yes) / voters || 0)}%)\n:x: : ${no} non (${Math.round((100 * no) / voters || 0)}%)`;
  } else if (poll.type === 1) {
    for (let i = 0; i < Object.keys(poll.votes).length; i++) {
      const r = reactions.multiple[i];
      results += `${r} : ${poll.votes[r].length} ${poll.customAnswers[i]} (${(100 * poll.votes[r].length) / voters || 0}%)\n`;
    }
  }
  results += `\n:bust_in_silhouette: : ${voters} votant${voters > 1 ? 's' : ''}.`;

  const channelMessages = client.guild.channels.resolve(poll.channel).messages;
  const message = channelMessages.resolve(poll.id) || await channelMessages.fetch(poll.id);
  if (!message) return;

  const embed = message.embeds[0];
  embed.setColor(client.config.colors.success)
    .setTitle(`Ce vote est fini ! ${stopped ? '*(arrêté)*' : ''}`)
    .addField('Résultats :', results);

  message.reactions.removeAll();
  message.edit(embed);
}

export async function checkPolls(client) {
  const polls = await db.polls.find({ finish: { $lt: Date.now() } }).catch(console.error);
  for (const poll of polls) endPoll(client, poll);
}

class Poll extends Command {
  constructor() {
    super('Poll');
    this.aliases = ['poll', 'vote', 'sondage'];
    this.usage = 'poll <durée> [-a] "<sondage>" ["réponse 1"] ["réponse 2"] [...]';
    this.examples = ['poll 10m "votre sondage" "réponse 1" "réponse 2" "réponse 3" "réponse 4"', 'vote 10m votre sondage', 'sondage 10m "votre sondage" -a "réponse 1" "réponse 2" '];
    this.enabledInHelpChannels = false;
  }

  async execute(client, message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.invalidCmd, message.member);

    const duration = args.shift(); // Extraction de la durée
    const isAnonymous = args.includes('-a');
    if (isAnonymous) args.splice(args.indexOf('-a'), 1);
    const answers = extractQuotedText(args.join(' ')); // Array de toutes les réponses
    const question = answers.shift() || args.join(' '); // Extraction de la question
    const questionType = answers.length === 0 ? 0 : 1; // 0 = oui/non | 1 = réponse spécifique

    const wait = toTimestamp(duration) * 1000;

    if (!wait || isNaN(wait)) return message.channel.sendError(this.config.invalidDuration, message.member);
    if (Date.now() + wait < Date.now()) return message.channel.sendError(this.config.invalidDuration, message.member);
    if (wait > client.config.miscellaneous.maxPollDuration) return message.channel.sendError(this.config.tooLong, message.member);

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
      .setTimestamp();
    if (isAnonymous) embed.setDescription('Ce sondage est anonyme.');

    const msg = await message.channel.send(embed);

    const possibleReactions = [];
    if (questionType === 0) {
      for (const r of reactions.yesno) {
        await msg.react(r);
        possibleReactions.push(r);
      }
    } else if (questionType === 1) {
      for (let i = 0; i < answers.length; i++) {
        await msg.react(reactions.multiple[i]);
        possibleReactions.push(reactions.multiple[i]);
      }
    }

    for (const r of reactions.basic) await msg.react(r);

    embed.setColor(client.config.colors.default);
    await msg.edit(embed);

    const votes = {};
    for (let i = 0; i < possibleReactions.length; i++) {
      votes[possibleReactions[i]] = [];
    }

    await db.polls.insert({
      id: msg.id,
      channel: message.channel.id,
      finish: Date.now() + wait,
      duration: wait,
      type: questionType,
      votes,
      creator: message.author.id,
      question,
      customAnswers: questionType === 0 ? null : answers,
      isAnonymous,
    });
  }
}

export default Poll;
