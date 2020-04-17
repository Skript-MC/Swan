/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import { config } from '../main';

export function discordSuccess(description, message) {
  const embed = new MessageEmbed()
    .setAuthor(message.member.nickname || message.author.username, message.author.avatarURL())
    .attachFiles(['./assets/success.png'])
    .setThumbnail('attachment://success.png')
    .setTitle('Succès')
    .setColor(config.colors.success)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Exécuté par ${message.member.nickname || message.author.username}`);
  return embed;
}

export function discordInfo(description, message) {
  const embed = new MessageEmbed()
    .setAuthor(message.member.nickname || message.author.username, message.author.avatarURL())
    .attachFiles(['./assets/information.png'])
    .setThumbnail('attachment://information.png')
    .setTitle('Information')
    .setColor(config.colors.default)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Exécuté par ${message.member.nickname || message.author.username}`);
  return embed;
}

export function discordError(description, message) {
  const embed = new MessageEmbed()
    .setAuthor(message.member.nickname || message.author.username, message.author.avatarURL())
    .attachFiles(['./assets/error.png'])
    .setThumbnail('attachment://error.png')
    .setTitle('Erreur')
    .setColor(config.colors.error)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Exécuté par ${message.member.nickname || message.author.username}`);
  return embed;
}
