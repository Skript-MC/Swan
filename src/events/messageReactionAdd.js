/* eslint-disable import/no-cycle */
import { client, config } from '../main';
import CreditsManager from '../helpers/CreditsManager';

export default async function reactionAddHandler(reaction, user) {
  const message = reaction.message;

  if (user.bot
    || message.channel.id !== config.channels.suggestion) return;

  // On ajoute les crédits (après l'antispam #snippets)
  if (message.author.id !== user.id) {
    let valueAdd = config.credits.addReaction;
    if (message.member.roles.cache.has(config.roles.nitrobooster)) valueAdd *= config.credits.bonuses.nitroBooster;
    CreditsManager.addToMember(message.guild.members.cache.get(user.id), valueAdd);

    let valueReceive = config.credits.addReaction;
    if (message.member.roles.cache.has(config.roles.nitrobooster)) valueReceive *= config.credits.bonuses.nitroBooster;
    CreditsManager.addToMember(message.member, valueReceive);
  }

  const guild = client.guilds.cache.get(config.bot.guild);
  const link = `https://discordapp.com/channels/${guild.id}/${config.channels.suggestion}/${message.id}`;

  if (reaction.emoji.name === '✅') {
    const reactionners = message.reactions.cache.find(r => r.emoji.name === '❌').users;
    if (typeof reactionners.cache.get(user.id) !== 'undefined') reactionners.remove(user);

    const positive = reaction.count;
    if (positive === 20) {
      guild.channels.cache.get(config.channels.main).send(`:fire: La suggestion de ${message.embeds[0].title.replace(/Suggestion de (\w+) \(\d+\)/, '$1')} devient populaire ! Elle a déjà 20 avis positifs !\nAvez-vous pensé à y jeter un oeil ? Qu'en pensez-vous ?\nLien : ${link}`);
    }
  } else if (reaction.emoji.name === '❌') {
    const reactionners = message.reactions.cache.find(r => r.emoji.name === '✅').users;
    if (typeof reactionners.cache.get(user.id) !== 'undefined') reactionners.remove(user);

    const negative = reaction.count;
    if (negative === 10) {
      guild.channels.cache.get(config.channels.logs).send(`:warning: La suggestion de ${message.embeds[0].title.replace(/Suggestion de (\w+) \(\d+\)/, '$1')} a reçu beaucoup de réactions négatives ! Elle a 10 avis contre.\nLien : ${link}`);
    }
  }
}
