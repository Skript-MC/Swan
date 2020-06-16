import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '../../structures/Command';

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

  async execute(client, message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.invalidCmd, message.member);
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.channel.sendError(this.config.pseudoNotFound, message.member);

    const roles = [];
    for (const role of target.roles.cache.array()) {
      if (role.name !== '@everyone') roles.push(role);
    }

    let presence = '';
    presence += `Statut : ${explain(target.presence.status)}\n`;
    if (target.presence.activities[0]) {
      if (target.presence.activities[0].type === 'PLAYING') presence += `Joue à \`${target.presence.activities[0].name}\`\n`;
      else if (target.presence.activities[0].type === 'STREAMING') presence += 'Est en live\n';
      else if (target.presence.activities[0].type === 'LISTENING') presence += `Écoute (sur ${target.presence.activities[0].name}) :\n`;
      else if (target.presence.activities[0].type === 'WATCHING') presence += `Regarde : ${target.presence.activities[0].name}\n`;
      else if (target.presence.activities[0].type === 'CUSTOM_STATUS') presence += `${target.presence.activities[0].name}\n`;

      if (target.presence.activities[0].details) presence += `↳ ${target.presence.activities[0].details}\n`;
      if (target.presence.activities[0].state) presence += `↳ ${target.presence.activities[0].state}\n`;
      if (target.presence.activities[0].timestamps) presence += `↳ A commencé ${moment(target.presence.activities[0].timestamps.start).format('[le] DD/MM/YYYY [à] HH:mm:ss')}\n`;
    }

    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .setAuthor(`Informations sur le membre ${target.user.username}`)
      .setFooter(`Exécuté par ${message.author.username}`)
      .setThumbnail(target.user.avatarURL())
      .setTimestamp()
      .addField(this.config.embed.names, `Pseudo : \`${target.user.username}\`\nSurnom : \`${target.displayName}\`\nDiscriminant : ${target.user.discriminator}\nIdentifiant : ${target.id}\n`, true)
      .addField(this.config.embed.created, moment(target.user.createdAt).format('[le] DD/MM/YYYY [à] HH:mm:ss'), true)
      .addField(this.config.embed.joined, `${moment(new Date(target.joinedTimestamp)).format('[le] DD/MM/YYYY [à] HH:mm:ss')}`, true)
      .addField(this.config.embed.roles, `${target.roles.cache.size - 1 === 0 ? 'Aucun' : `${target.roles.cache.size - 1} : ${roles.join(', ')}`}`, true)
      .addField(this.config.embed.presence, presence, true);

    message.channel.send(embed);
  }
}

export default UserInfos;
