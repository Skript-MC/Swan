/* eslint-disable nonblock-statement-body-position */
/* eslint-disable curly */
import { RichEmbed } from 'discord.js';
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config } from '../../main';
import { formatDate } from '../../utils';

function explain(status) {
  if (status === 'online')
    return 'En ligne';
  else if (status === 'idle')
    return 'AFK';
  else if (status === 'dnd')
    return 'Ne pas déranger';
  else if (status === 'offline')
    return 'Hors ligne';
  else
    return 'Une erreur est survenue.';
}

class UserInfos extends Command {
  constructor() {
    super('userinfo');
    this.regex = /(?:user|utilisateur)-?info(?:rmation)?s?-?(?:utilisateur)?s?/gimu;
    this.usage = `${config.bot.prefix}user-info <@mention | ID>`;
    this.examples.push('userinfo @noftaly', 'user-infos 188341077902753794');
  }

  async execute(message, args) {
    if (args.length < 1) return discordError(this.config.invalidCmd, message);
    const target = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!target) return discordError(this.config.pseudoNotFound, message);

    const roles = [];
    for (const role of target.roles.array()) {
      if (role.name !== '@everyone') {
        roles.push(role);
      }
    }

    let presence = '';
    presence += `Statut : ${explain(target.presence.status)}\n`;
    if (target.presence.game) {
      if (target.presence.game.type === 0)
        presence += `Joue à \`${target.presence.game.name}\`\n`;
      else if (target.presence.game.type === 1)
        presence += 'Est en live\n';
      else if (target.presence.game.type === 2)
        presence += `Écoute : ${target.presence.game.name}\n`;
      else if (target.presence.game.type === 3)
        presence += `Regarde : ${target.presence.game.name}\n`;

      if (target.presence.game.details)
        presence += `↳ ${target.presence.game.details}\n`;
      if (target.presence.game.party)
        presence += `↳ ${target.presence.game.party}\n`;
      if (target.presence.game.state)
        presence += `↳ ${target.presence.game.state}\n`;
      if (target.presence.game.timestamps)
        presence += `↳ À commencé ${formatDate(target.presence.game.timestamps.start)}\n`;
    }

    const embed = new RichEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Informations sur le membre ${target.user.username}`, config.bot.avatar)
      .setFooter(`Executé par ${message.author.username}`)
      .setTimestamp()
      .addField(this.config.embed.names, `Pseudo : ${target.user.username}\nSurnom : ${target.displayName}\nIdentifiant : ${target.id}\n`, true)
      .addField(this.config.embed.created, formatDate(target.user.createdAt), true)
      .addField(this.config.embed.joined, `${formatDate(new Date(target.joinedTimestamp))}`, true)
      .addField(this.config.embed.roles, `${target.roles.array().length - 1 === 0 ? 'Aucun' : `${target.roles.array().length - 1} : ${roles.join(', ')}`}`, true)
      .addField(this.config.embed.presence, presence, true);

    message.channel.send(embed);
  }
}

export default UserInfos;
