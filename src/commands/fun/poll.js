/* eslint-disable consistent-return */
import { RichEmbed } from 'discord.js';
import Command from '../../components/Command';
import { config } from '../../main';
import { discordError, discordInfo } from '../../components/Messages';
import { formatDate } from '../../utils';

const durations = {
  's(ec(ond)?)?e?': 1,
  'min(ute)?': 60,
  'h(our|eure?)?': 3600,
  '(d(ay)?)|(j(our)?)': 86400,
};
const reactions = ['✅', '❌', 'ℹ', '🛑'];

function endPoll(msg, embed, collectors, results) {
  embed.setColor(config.colors.success)
    .setDescription('Ce vote est finit !')
    .addField('Résultats :', `:white_check_mark: : ${results.yes} oui (${100 * results.yes / (results.yes + results.no) || 0}%)\n:x: : ${results.no} non (${100 * results.no / (results.yes + results.no) || 0}%)\n:bust_in_silhouette: : ${(results.yes + results.no)} votant(s).`);
  collectors.collector.stop();
  collectors.collectorInfo.stop();
  collectors.collectorStop.stop();
  msg.clearReactions();
  msg.edit(embed);
}

class Poll extends Command {
  constructor() {
    super('poll');
    this.usage = `${config.bot.prefix}poll <durée> [description avec espaces]`;
    this.examples.push('poll 10min Mon_titre Ma description');
    this.regex = /poll|vote|sond(?:age)?/gmui;
  }

  async execute(message, args) {
    if (args.length < 2) return discordError(config.messages.commands.poll.invalidCmd, message);
    for (const duration of Object.keys(durations)) {
      if (args[0].match(new RegExp(duration, 'gmui'))) {
        let finished;
        let no = 0;
        let yes = 0;

        const mult = durations[duration];
        const time = args[0].split(/[a-zA-Z]+/gmui)[0];
        const wait = mult * time * 1000;
        if (wait > config.miscellaneous.maxPollDuration) {
          return discordError((config.messages.commands.poll.tooLong).replace('%s', `${config.miscellaneous.maxPollDuration}`), message);
        }
        // wait = durations[duration] * args[0].split(/[a-zA-Z]+/gmui)[0] * 1000;
        const date = new Date(Date.now() + wait);
        const end = formatDate(date);

        const embed = new RichEmbed()
          .setAuthor(`Vote de ${message.author.username}`, message.author.avatarURL)
          .setTitle(args[1].replace(/_/gmui, ' '))
          .setDescription(`${args.splice(2, args.length).join(' ')}\n\nCe vote dure : ${args[0]} (Finit ${end})`)
          .setFooter(`Executé par ${message.author.username}`)
          .setTimestamp();

        const msg = await message.channel.send(embed);
        for (const r of reactions) await msg.react(r);

        embed.setColor(config.colors.default);
        await msg.edit(embed);

        const collector = msg
          .createReactionCollector((reaction, user) => !user.bot
            && (reaction.emoji.name === '✅'
            || reaction.emoji.name === '❌'))
          .once('collect', (reaction) => {
            if (reaction.emoji.name === '❌') no += 1;
            else if (reaction.emoji.name === '✅') yes += 1;
          });

        const collectorInfo = msg
          .createReactionCollector((reaction, user) => !user.bot
            && reaction.emoji.name === 'ℹ'
            && user.id === message.author.id)
          .once('collect', () => {
            discordInfo(config.messages.commands.poll.pollInfos, message);
          });

        const collectorStop = msg
          .createReactionCollector((reaction, user) => !user.bot
            && reaction.emoji.name === '🛑'
            && user.id === message.author.id)
          .once('collect', () => {
            const results = { yes, no };
            const collectors = { collector, collectorInfo, collectorStop };
            endPoll(msg, embed, collectors, results);
            finished = true;
          });

        setTimeout(() => {
          if (finished) return;
          const results = { yes, no };
          const collectors = { collector, collectorInfo, collectorStop };
          endPoll(msg, embed, collectors, results);
        }, wait);
        return;
      }
    }
    discordError(config.messages.commands.poll.invalidCmd, message);
  }
}

export default Poll;
