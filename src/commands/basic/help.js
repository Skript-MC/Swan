import { RichEmbed } from 'discord.js';
import Command from '../../components/Command';
import { commands, config } from '../../main';
import { discordError } from '../../components/Messages';

const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
const cmdPerPage = config.miscellaneous.cmdPerPagesInHelp;

class Help extends Command {
  constructor() {
    super('help');
    this.regex = /(help|aide)/gimu;
    this.usage = 'help [<commande | page>]';
    this.examples.push('help ping', 'help', 'help 4');
  }

  async execute(message, args, page) {
    // eslint-disable-next-line no-nested-ternary
    page = page ? parseInt(page, 10) : args[0] ? parseInt(args[0] - 1, 10) : 0;
    page = isNaN(page) ? 0 : page;

    const totalPages = Math.ceil(commands.length / cmdPerPage);

    // S'il n'y a pas d'arguments, on montre la liste de toutes les commandes
    if (args.length === 0 || Number.isInteger(parseInt(args[0], 10))) {
      const embed = new RichEmbed()
        .setAuthor(`${commands.length} commandes disponibles (page ${page + 1}/${totalPages})`, config.avatar)
        .setDescription(config.messages.commands.help.header)
        .setFooter(`Executé par ${message.author.username}`)
        .setTimestamp();

      for (let i = 0; i < cmdPerPage && i < page * cmdPerPage + cmdPerPage && page * cmdPerPage + i <= commands.length - 1; i++) {
        const cmd = commands[page * cmdPerPage + i];
        embed.addField(`${cmd.name} ⁕ ${cmd.usage} ${cmd.permissions.some(role => role === 'Staff') > 0 ? ':octagonal_sign:' : ''}`, `${cmd.help}`, false);
      }

      // Envoyer l'embed, ajouter les réactions, puis modifier sa couleur en bleu
      const helpEmbed = await message.channel.send(embed);
      for (const r of reactions) await helpEmbed.react(r);
      embed.setColor(config.colors.default);
      helpEmbed.edit(embed);

      const collector = helpEmbed
        .createReactionCollector((reaction, user) => user.id === message.author.id
            && reactions.includes(reaction.emoji.name))
        .once('collect', (reaction) => {
          helpEmbed.delete();
          if (reaction.emoji.name === '⏮') {
            this.execute(message, args, 0);
          } else if (reaction.emoji.name === '◀') {
            const prevPage = page <= 0 ? totalPages - 1 : page - 1;
            this.execute(message, args, prevPage);
          } else if (reaction.emoji.name === '🇽') {
            message.delete();
          } else if (reaction.emoji.name === '▶') {
            const nextPage = page + 1 >= totalPages ? 0 : page + 1;
            this.execute(message, args, nextPage);
          } else if (reaction.emoji.name === '⏭') {
            this.execute(message, args, totalPages - 1);
          }
          collector.stop();
        });
    } else {
      let cmds = commands.filter(elt => elt.name.toUpperCase().includes(args.join(' ').toUpperCase()));
      const results = cmds.length;

      // Limite à 10 élements. + simple à gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages)
      cmds = cmds.slice(0, 10);

      if (results === 0) {
        return discordError(config.messages.commands.help.cmdDoesntExist, message);
      } else if (results === 1) {
        return this.sendDetails(message, cmds[0]);
      } else {
        let selectorMsg = await message.channel.send(this.config.searchResults.replace('%r', results).replace('%s', args.join(' ')));
        for (let i = 0; i < results; i++) {
          selectorMsg = await selectorMsg.edit(`${selectorMsg.content}\n${reactionsNumbers[i]} "${cmds[i].name}" (\`${cmds[i].usage}\`)`);
          await selectorMsg.react(reactionsNumbers[i]);
        }
        await selectorMsg.react('❌');

        const collectorNumbers = selectorMsg
          .createReactionCollector((reaction, user) => !user.bot
            && user.id === message.author.id
            && reactionsNumbers.includes(reaction.emoji.name))
          .once('collect', (reaction) => {
            selectorMsg.delete();
            this.sendDetails(message, cmds[reactionsNumbers.indexOf(reaction.emoji.name)]);
            collectorNumbers.stop();
          });

        const collectorStop = selectorMsg
          .createReactionCollector((reaction, user) => !user.bot
            && user.id === message.author.id
            && reaction.emoji.name === '❌')
          .once('collect', () => {
            message.delete();
            selectorMsg.delete();
            collectorNumbers.stop();
            collectorStop.stop();
          });
      }
    }
  }

  async sendDetails(message, command) {
    const embed = new RichEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Informations sur "${command.name}"`, config.bot.avatar)
      .setFooter(`Executé par ${message.author.username}`)
      .setTimestamp();

    let perms = this.config.details.everyone;
    if (command.permissions.length > 0) perms = command.permissions.join(', ');

    let ex = '';
    for (const e of command.examples) ex = `${ex} | \`${config.bot.prefix}${e}\``;
    ex = ex.slice(3, ex.length); // Enlève les espaces et la barre au début, et l'espace  à la fin.
    ex = ex === '' ? this.config.details.noExample : `${ex}`;


    let desc = command.description;
    if (command.name === 'Automatic Messages') {
      desc = desc.replace('%s', `${Object.keys(config.messages.commands.automatic_messages.messages).join(', ')}`);
    }

    const channels = [];
    if (command.requiredChannels.length === 0) {
      channels.push(this.config.details.all);
    } else {
      for (const id of command.requiredChannels) {
        channels.push(message.guild.channels.get(id).name);
      }
    }
    embed.addField(`:star: **${command.name}**`, `${this.config.details.description} ${desc}\n${this.config.details.category} ${command.category}\n${this.config.details.utilisation} ${command.usage}\n${this.config.details.examples} ${ex}\n${this.config.details.usable} ${perms}\n${this.config.details.channels} ${channels.join(', ')}\n‌‌ `, true);

    message.channel.send(embed);
  }
}

export default Help;
