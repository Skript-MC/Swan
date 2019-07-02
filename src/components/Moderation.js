/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import { RichEmbed } from 'discord.js';
import { config, client, database } from '../main';
import { formatDate, secondToDuration } from '../utils';

async function sendLog(info, guild, result = undefined) {
  let action;
  if (info.sanction === 'ban') action = 'Restriction du discord';
  else if (info.sanction === 'hardban') action = 'Banissement';
  else if (info.sanction === 'mute') action = "Mute des channels d'aide";
  else if (info.sanction === 'avertissement') action = 'Avertissement';

  // Création de l'embed
  const embed = new RichEmbed()
    .setColor(info.color)
    .setTitle('Nouveau cas :')
    .setTimestamp()
    .addField(':bust_in_silhouette: Utilisateur', `${info.member}\n(${info.member.id})`, true)
    .addField(':cop: Modérateur', `${info.mod}\n(${info.mod.id})`, true)
    .addField(':tools: Action', `${action}`, true);

  if (result) embed.setFooter(`ID : ${result._id}`);

  if (info.finish && info.duration && info.finish !== -1) {
    embed.addField(':stopwatch: Durée', `${secondToDuration(info.duration)}\nExpire ${formatDate(info.finish)}`, true);
  } else if (info.duration) {
    embed.addField(':stopwatch: Durée', `${secondToDuration(info.duration)}`, true);
  }

  embed.addField(':scroll: Raison', `${info.reason}`, true);
  if (info.privateChannel) embed.addField(':speech_left: Channel privé', `${info.privateChannel}`, true);

  // Channel log
  const logChannel = guild.channels.find(c => c.name === config.moderation.log.channelName && c.type === 'text');
  logChannel.send(embed);
}

/**
 * Fonction qui envoie un log des actions de modération
 * @param {Object} info - Informations sur l'action de modération:
 * - info.log: {boolean} si l'action doit être stockée dans la database
 * - info.sanction: {string} type de sanction appliquée
 * - info.color: {string} couleur de l'embed
 * - info.member: {GuildMember} utilisateur qui a été sanctionné
 * - info.mod: {User} modérateur qui a sanctionné
 * - info.duration: {string} durée de la sanction
 * - info.finish: {string} fin de la sanciton
 * - info.reason: {string} raison de la sanction
 * - info.privateChannel?: {GuildChannel} (facultatif) Channel privé créé entre le staff et l'utilisateur
 * @param {Guild} guild
 */
export function modLog(info, guild) {
  // Ajout à la database
  if (info.log) {
    database.insert({
      sanction: info.sanction,
      reason: info.reason,
      member: info.member.user.id,
      modid: info.mod.id,
      start: Date.now(),
      duration: info.duration || 0,
      finish: info.finish,
    });
    // On retrouve la sanction qu'on vient d'ajouter pour avoir son ID
    database.findOne({ member: info.member.id, sanction: info.sanction }, (err, result) => {
      if (err) console.error(err);
      sendLog(info, guild, result);
    });
  } else {
    sendLog(info, guild);
  }
}

/**
 * Fonction qui permet d'unban/unmute un joueur
 * @param {Object} info - Informations sur l'action de modération:
 * - member: {GuildMember} utilisateur a qui doit être retiré la sanction
 * - title: {string} Titre de l'embed de log
 * - mod: {User} modérateur qui a retiré la sanction
 * - sanction: {string} type de sanction à retirer (ban/mute)
 * - reason: {string} raison de la sanction
 * - id: {string} ID de la sanction dans la database
 * @param {Guild} guild
 */
export function removeSanction(info, guild) {
  database.remove({ _id: info.id }, {}, (err) => {
    if (err) console.error(err);

    const role = info.sanction === 'ban'
      ? guild.roles.find(r => r.name === config.moderation.banRole)
      : guild.roles.find(r => r.name === config.moderation.muteRole);
    if (info.member.roles.has(role.id)) {
      try {
        info.member.removeRole(role);
      } catch (e) {
        console.error(e);
      }
    }

    const logChannel = guild.channels.find(c => c.name === config.moderation.log.channelName && c.type === 'text');
    const embed = new RichEmbed()
      .setColor(config.colors.success)
      .setTitle(info.title)
      .setTimestamp()
      .addField(':bust_in_silhouette: Utilisateur', `${info.member}\n(${info.member.id})`, true)
      .addField(':cop: Modérateur', `${info.mod}\n(${info.mod.id})`, true)
      .addField(':tools: Action', `Un${info.sanction}`, true)
      .addField(':scroll: Raison', `${info.reason}\nID : ${info.id}`, true);
    logChannel.send(embed);
  });
}

// Si sous-fifre
export function isBan(id) {
	return new Promise(resolve => {
    database.findOne({ member: id, sanction: 'ban' }, (err, result) => {
      if (err) console.error(err);
      resolve(!!result); // Cast result en boolean. Donc si il y a un résultat : true, sinon : false
    });
  });
}

// Bannir vraiment du discord
export function hardBan(member, ban) {
  // Ban
  if (ban) member.ban();

  // Suppression de la database
  database.remove({ _id: member.id }, {}, (err) => {
    if (err) console.error(err);
  });

  // Suppression du channel perso
  const guild = client.guilds.get(config.bot.guild);
  const chan = guild.channels.find(c => c.name === `${config.moderation.banChannelPrefix}${member.user.username.replace(/[^a-zA-Z]/gimu, '').toLowerCase()}` && c.type === 'text');
  if (chan) chan.delete();

  // Envoie d'un log
  return modLog({
    log: false,
    sanction: 'hardban',
    color: '#000000',
    member,
    mod: client.user,
    reason: ban ? "Déconnexion du discord lors d'un banissement" : 'Banni par un modérateur',
  }, guild);
}
