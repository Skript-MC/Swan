/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import { config } from '../main';
import { padNumber } from '../utils';

let step = 0;
const maxSteps = 11;
export function success(msg) {
  step++;
  console.log(`[SkriptMc Bot] (${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) ✔️  (${step}/${maxSteps}) ${msg}`);
}
export function error(msg) {
  console.log(`[SkriptMc Bot] (${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) ✖️  ${msg}`);
}

export function discordSuccess(description, message) {
  const embed = new MessageEmbed()
    .setAuthor(message.member.nickname || message.author.username, message.author.avatarURL)
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
    .setAuthor(message.member.nickname || message.author.username, message.author.avatarURL)
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
    .setAuthor(message.member.nickname || message.author.username, message.author.avatarURL)
    .attachFiles(['./assets/error.png'])
    .setThumbnail('attachment://error.png')
    .setTitle('Erreur')
    .setColor(config.colors.error)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Exécuté par ${message.member.nickname || message.author.username}`);
  return embed;
}
