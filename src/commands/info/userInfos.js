import { MessageEmbed } from 'discord.js';
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config } from '../../main';
import { formatDate } from '../../utils';

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
    if (args.length < 1) return message.channel.send(discordError(this.config.invalidCmd, message));
    const target = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!target) return message.channel.send(discordError(this.config.pseudoNotFound, message));

    const roles = [];
    for (const role of target.roles.array()) {
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
      if (target.presence.activity.timestamps) presence += `↳ À commencé ${formatDate(target.presence.activity.timestamps.start)}\n`;
    }

    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Informations sur le membre ${target.user.username}`, config.bot.avatar)
      .setFooter(`Éxécuté par ${message.author.username}`)
      .setTimestamp()
      .addField(this.config.embed.names, `Pseudo : \`${target.user.username}\`\nSurnom : \`${target.displayName}\`\nDiscriminant : ${target.user.discriminator}\nIdentifiant : ${target.id}\n`, true)
      .addField(this.config.embed.created, formatDate(target.user.createdAt), true)
      .addField(this.config.embed.joined, `${formatDate(new Date(target.joinedTimestamp))}`, true)
      .addField(this.config.embed.roles, `${target.roles.array().length - 1 === 0 ? 'Aucun' : `${target.roles.array().length - 1} : ${roles.join(', ')}`}`, true)
      .addField(this.config.embed.presence, presence, true);

    message.channel.send(embed);
  }
}

export default UserInfos;
