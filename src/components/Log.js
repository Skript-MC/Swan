/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import { RichEmbed } from 'discord.js';
import { config, database } from '../main';
import { formatDate, secondToDuration } from '../utils';

async function sendLog(info, guild, result = undefined) {
  let action;
  if (info.sanction === 'ban') action = 'Restriction du discord';
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

  // Création du channel log
  let logChannel = guild.channels.find(c => c.name === config.moderation.log.channelName && c.type === 'text');
  if (!logChannel) {
    try {
      logChannel = await guild.createChannel(config.moderation.log.channelName, 'text');
      logChannel.setParent(config.moderation.log.categoryID);
      logChannel.overwritePermissions(guild.roles.find(r => r.name === '@everyone'), { VIEW_CHANNEL: false });
      logChannel.overwritePermissions(guild.roles.find(r => r.name === 'Staff'), {
        VIEW_CHANNEL: true,
        ADD_REACTIONS: false,
        SEND_MESSAGES: false,
        SEND_TTS_MESSAGES: false,
        MANAGE_MESSAGES: false,
      });
    } catch (e) {
      console.error(`Error while attempting to create the channel : ${e}`);
    }
  }
  logChannel.send(embed);
}

/**
 * Fonction qui envoie un log des actions de modération
 * @param {Object} info - Informations sur l'action de modération:
 * - log: {boolean} si l'action doit être stockée dans la database
 * - sanction: {string} type de sanction appliquée
 * - color: {string} couleur de l'embed
 * - member: {GuildMember} utilisateur qui a été sanctionné
 * - mod: {User} modérateur qui a sanctionné
 * - duration: {string} durée de la sanction
 * - finish: {string} fin de la sanciton
 * - reason: {string} raison de la sanction
 * - privateChannel?: {GuildChannel} (facultatif) Channel privé créé entre le staff et l'utilisateur
 * @param {Guild} guild - Guild dans laquelle la sanction a été appliquée
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
 * @param {Guild} guild - Guild dans laquelle la sanction doit être retirée
 */
export function removeSanction(info, guild) {
  database.remove({ _id: info.id }, {}, (err2) => {
    if (err2) console.error(err2);

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
