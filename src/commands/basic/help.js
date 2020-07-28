import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { jwDistance, selectorMessage, parsePage } from '../../utils';
import { db } from '../../main';

const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class Help extends Command {
  constructor() {
    super('Help');
    this.aliases = ['help', 'aide'];
    this.usage = 'help [<commande | page>]';
    this.examples = ['help ping', 'help', 'help 4'];
    this.enabledInHelpChannels = false;
  }

  async execute(client, message, args) {
    const cmdPerPage = client.config.miscellaneous.cmdPerPagesInHelp;
    const totalPages = Math.ceil(client.commands.length / cmdPerPage);
    const page = parsePage(args[0], totalPages);

    // S'il n'y a pas d'arguments ou une page, on montre la liste de toutes les commandes
    if (args.length === 0 || Number.isInteger(parseInt(args[0], 10))) {
      const embed = new MessageEmbed()
        .attachFiles([client.config.bot.avatar])
        .setAuthor(`${client.commands.length} commandes disponibles (page ${page + 1}/${totalPages})`, 'attachment://logo.png')
        .setDescription(this.config.header)
        .setFooter(`Exécuté par ${message.author.username}`)
        .setTimestamp();

      for (let i = 0; i < cmdPerPage && i < page * cmdPerPage + cmdPerPage && page * cmdPerPage + i <= client.commands.length - 1; i++) {
        const cmd = client.commands[page * cmdPerPage + i];
        embed.addField(`${cmd.name} ⁕ ${client.config.bot.prefix}${cmd.usage}`, `${cmd.permissions.some(role => role === 'Staff' || role === 'Modérateur Discord' || role === 'Gérant') > 0 ? ':octagonal_sign:' : ''} ${cmd.help}`, false);
      }

      // Envoyer l'embed, ajouter les réactions, puis modifier sa couleur en bleu
      const helpEmbed = await message.channel.send(embed);
      for (const r of reactions) await helpEmbed.react(r);
      embed.setColor(client.config.colors.default);
      helpEmbed.edit(embed);

      const collector = helpEmbed
        .createReactionCollector((reaction, user) => user.id === message.author.id
            && reactions.includes(reaction.emoji.name))
        .once('collect', (reaction) => {
          helpEmbed.delete();
          if (reaction.emoji.name === '⏮') {
            this.execute(client, message, [1]);
          } else if (reaction.emoji.name === '◀') {
            this.execute(client, message, [page]);
          } else if (reaction.emoji.name === '🇽') {
            message.delete();
          } else if (reaction.emoji.name === '▶') {
            this.execute(client, message, [page + 2]);
          } else if (reaction.emoji.name === '⏭') {
            this.execute(client, message, [totalPages]);
          }
          collector.stop();
        });
    } else {
      // On cherche parmis les noms des commandes
      let cmds = client.commands.filter(elt => elt.name.toUpperCase().includes(args.join(' ').toUpperCase()));
      if (cmds.length === 0) {
        // Et parmis les noms des commandes, sans espaces
        cmds = client.commands.filter(elt => elt.name.toUpperCase().replace(/ /g, '').includes(args.join(' ').toUpperCase()));
      }
      if (cmds.length === 0) {
        // Et parmis les alias
        cmds = client.commands.filter((elt) => {
          let found = false;
          elt.aliases.forEach((alias) => {
            found = alias.toUpperCase().replace(/ /g, '').includes(args.join('').toUpperCase());
          });
          return found;
        });
      }

      const results = cmds.length;

      if (results === 0) {
        // Si la commande est inconnue
        const matches = [];
        for (const elt of client.commands) {
          for (const alias of elt.aliases) {
            if (jwDistance(args.join(''), alias) >= client.config.miscellaneous.commandSimilarity) {
              matches.push(elt);
              break;
            }
          }
        }

        if (matches.length === 0) {
          message.channel.sendError(this.config.cmdDoesntExist, message.member);
        } else {
          const cmdList = matches.map(m => m.name).join('`, `');
          const msg = await message.channel.send(this.config.cmdSuggestion.replace('%c', args.join('')).replace('%m', cmdList));

          if (matches.length === 1) msg.react('✅');
          else for (let i = 0; i < reactionsNumbers.length && i < matches.length; i++) await msg.react(reactionsNumbers[i]);

          const collector = msg
            .createReactionCollector((reaction, user) => !user.bot
                && user.id === message.author.id
                && (reaction.emoji.name === '✅' || reactionsNumbers.includes(reaction.emoji.name)))
            .once('collect', (reaction) => {
              collector.stop();
              msg.delete();
              const index = reaction.emoji.name === '✅' ? 0 : reactionsNumbers.indexOf(reaction.emoji.name);
              return this.sendDetails(client.config, message, matches[index]);
            });
        }
      } else if (results === 1) {
        this.sendDetails(client.config, message, cmds[0]);
      } else {
        selectorMessage(
          client,
          cmds,
          args.join(' '),
          message,
          this.config,
          cmd => `"${cmd.name}" (\`.${cmd.usage}\`)`,
          this.sendDetails,
        );
      }
    }
  }

  async sendDetails(config, message, command, thisConfig = this.config) {
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor(`Informations sur "${command.name}"`, 'attachment://logo.png')
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();

    let perms = thisConfig.details.everyone;
    if (command.permissions.length > 0) perms = command.permissions.join(', ');

    let ex = '';
    for (const e of command.examples) ex = `${ex} | \`${config.bot.prefix}${e}\``;
    ex = ex.slice(3, ex.length); // Enlève les espaces et la barre au début, et l'espace à la fin.
    ex = ex === '' ? thisConfig.details.noExample : `${ex}`;

    let desc = command.description;
    if (command.name === 'Automatic Messages') {
      const messages = await db.messages.find({ type: 'auto' }).catch(console.error);
      desc = desc.replace('%s', messages.length ? messages.map(msg => msg.title) : 'Aucun');
    } else if (command.name === 'Error Details') {
      const messages = await db.messages.find({ type: 'error' }).catch(console.error);
      desc = desc.replace('%s', messages.length ? messages.map(msg => msg.title) : 'Aucune');
    }

    const channels = [];
    if (command.requiredChannels.length === 0) {
      channels.push(thisConfig.details.all);
    } else {
      for (const id of command.requiredChannels) {
        channels.push(message.guild.channels.cache.get(id).name);
      }
    }
    if (!command.enabledInHelpChannels) {
      channels.push("sauf les salons d'aide");
    }

    embed.addField(`:star: **${command.name}**`, `${thisConfig.details.description} ${desc}\n${thisConfig.details.category} ${command.category}\n${thisConfig.details.utilisation} \`${config.bot.prefix}${command.usage}\`\n${thisConfig.details.aliases} \`${command.aliases.join('`, `')}\`\n${thisConfig.details.examples} ${ex}\n${thisConfig.details.usable} ${perms}\n${thisConfig.details.channels} ${channels.join(', ')}\n\n[(documentation en ligne)](${config.miscellaneous.documentation}#${command.name.replace(/ +/g, '-')})`, true);

    message.channel.send(embed);
  }
}

export default Help;
