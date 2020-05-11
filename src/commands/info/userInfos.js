import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '../../structures/Command';
import { config } from '../../main';

function explain(status) {
  switch (status) {
    case 'online':
      return 'En ligne';
    case 'idle':
      return 'AFK';
    case 'dnd':
      return 'Ne pas déranger';
    case 'offline':
      return 'Hors ligne';
    default:
      return 'Une erreur est survenue.';
  }
}

class UserInfos extends Command {
  constructor() {
    super('User Info');
    this.aliases = ['userinfo', 'user-info', 'user_info'];
    this.usage = 'user-info <@mention | ID>';
    this.examples = ['userinfo @noftaly', 'user-infos 188341077902753794'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.invalidCmd, message.member);
    const target = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);
    if (!target) return message.channel.sendError(this.config.pseudoNotFound, message.member);

    const roles = [];
    for (const role of target.roles.cache.array()) {
      if (role.name !== '@everyone') roles.push(role);
    }

    let presence = '';
    presence += `Statut : ${explain(target.presence.status)}\n`;
    if (target.presence.activity) {
      if (target.presence.activity.type === 0) presence += `Joue à \`${target.presence.activity.name}\`\n`;
      else if (target.presence.activity.type === 1) presence += 'Est en live\n';
      else if (target.presence.activity.type === 2) presence += `Écoute : ${target.presence.activity.name}\n`;
      else if (target.presence.activity.type === 3) presence += `Regarde : ${target.presence.activity.name}\n`;

      if (target.presence.activity.details) presence += `↳ ${target.presence.activity.details}\n`;
      if (target.presence.activity.party) presence += `↳ ${target.presence.activity.party}\n`;
      if (target.presence.activity.state) presence += `↳ ${target.presence.activity.state}\n`;
      if (target.presence.activity.timestamps) presence += `↳ A commencé ${moment(target.presence.activity.timestamps.start).format('[le] DD/MM/YYYY [à] HH:mm:ss')}\n`;
    }

    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor(`Informations sur le membre ${target.user.username}`, 'attachment://logo.png')
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp()
      .addField(this.config.embed.names, `Pseudo : \`${target.user.username}\`\nSurnom : \`${target.displayName}\`\nDiscriminant : ${target.user.discriminator}\nIdentifiant : ${target.id}\n`, true)
      .addField(this.config.embed.created, moment(target.user.createdAt).format('[le] DD/MM/YYYY [à] HH:mm:ss'), true)
      .addField(this.config.embed.joined, `${moment(new Date(target.joinedTimestamp)).format('[le] DD/MM/YYYY [à] HH:mm:ss')}`, true)
      .addField(this.config.embed.roles, `${target.roles.cache.array().length - 1 === 0 ? 'Aucun' : `${target.roles.cache.array().length - 1} : ${roles.join(', ')}`}`, true)
      .addField(this.config.embed.presence, presence, true);

    message.channel.send(embed);
  }
}

export default UserInfos;
