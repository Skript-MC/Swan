/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import { discordSuccess, discordError } from './messages';
import { db, config, client, logger } from '../main';
import { prunePseudo, secondToDuration } from '../utils';
import MusicBot from './Music';
import SanctionManager from './SanctionManager';

class Moderation {
  static async hardBan(member, reason, moderator) {
    // Ban
    member.ban();

    // Suppression de la database
    await db.sanctions.remove({ _id: member.id }).catch(console.error);

    // Suppression du channel perso
    const guild = client.guilds.cache.get(config.bot.guild);
    const chan = guild.channels.cache.find(c => c.name === `${config.moderation.banChannelPrefix}${prunePseudo(member)}` && c.type === 'text');
    if (chan) chan.delete();

    // Envoie d'un log
    const infos = {
      sanction: 'hardban',
      color: config.colors.hardban,
      member,
      mod: moderator,
      reason,
    };
    SanctionManager.addToHistory(infos);
    SanctionManager.addToSanctions(infos);
    SanctionManager.log(infos, guild);
  }

  static async ban(victim, reason, duration, moderator, cmdConfig, message, guild) {
    const role = guild.roles.cache.find(r => r.name === config.moderation.banRole);

    // Durée invalide
    if (duration < -1) {
      return message.channel.send(discordError(cmdConfig.invalidDuration, message));
    }
    // Durée max des modérateurs forum : 2j
    if (message.member.roles.cache.has(config.roles.forumMod) && (duration === -1 || duration > 172800)) {
      return message.channel.send(discordError(cmdConfig.durationTooLong));
    }

    let chan;
    if (duration !== -1) {
      // Ajouter le rôle Sous-Fiffre
      try {
        await victim.roles.add(role);
      } catch (_err) {
        message.channel.send(config.messages.errors.rolePermissions);
        logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
      }
      // Créer un channel perso
      chan = await SanctionManager.createChannel(victim, moderator, guild, message);
    }

    const infos = {
      sanction: 'ban',
      color: config.colors.ban,
      member: victim,
      mod: moderator,
      duration,
      finish: duration !== -1 ? Date.now() + duration * 1000 : -1,
      privateChannel: chan,
      reason,
    };

    // Vérifier dans la bdd si le joueur est déjà banni
    const result = await db.sanctions.findOne({ member: victim.id, sanction: 'ban' }).catch(console.error);
    if (result) {
      // Si oui on mets à jour la durée du ban
      db.sanctions.update(
        { _id: result._id },
        { $set: { duration, finish: infos.finish } },
      );
      infos.sanction = 'ban_prolongation';
      message.channel.send(discordSuccess(cmdConfig.durationUpdated.replace('%u', victim).replace('%d', secondToDuration(duration)), message));
      chan.send(cmdConfig.sanctionUpdated.replace('%d', secondToDuration(duration)));
      SanctionManager.log(infos, guild);
      return;
    }

    if (duration === -1) {
      const successMessage = cmdConfig.successfullyBanned
        .replace('%u', victim.user.username)
        .replace('%r', reason)
        .replace('%d', secondToDuration(duration));
      message.channel.send(discordSuccess(successMessage, message));
      return this.hardBan(victim, reason, moderator);
    }

    // Envoyer les messages
    const successMessage = cmdConfig.successfullyBanned
      .replace('%u', victim.user.username)
      .replace('%r', reason)
      .replace('%d', secondToDuration(duration));
    const whyHere = cmdConfig.whyHere
      .replace('%u', victim.user.username)
      .replace('%r', reason)
      .replace('%d', secondToDuration(duration));
    message.channel.send(discordSuccess(successMessage, message));
    chan.send(whyHere);

    // Envoyer les logs
    SanctionManager.addToHistory(infos);
    SanctionManager.addToSanctions(infos);
    SanctionManager.log(infos, guild);
  }

  static async mute(victim, reason, duration, moderator, cmdConfig, message, guild) {
    const role = guild.roles.cache.find(r => r.name === config.moderation.muteRole);

    // Durée invalide
    if (duration < -1) {
      return message.channel.send(discordError(cmdConfig.invalidDuration, message));
    }
    // Durée maximale des sanctions des modos forum : 2j
    if (message.member.roles.cache.has(config.roles.forumMod) && (duration !== -1 || duration > 172800)) {
      return message.channel.send(discordError(cmdConfig.durationTooLong, message));
    }

    const infos = {
      sanction: 'mute',
      color: config.colors.mute,
      member: victim,
      mod: moderator,
      duration,
      finish: duration !== -1 ? Date.now() + duration * 1000 : -1,
      reason,
    };

    // Vérifier dans la bdd si le joueur est déjà mute
    const result = await db.sanctions.findOne({ member: victim.id, sanction: 'mute' }).catch(console.error);
    if (result) {
      // Si oui on mets à jour la durée du mute
      db.sanctions.update(
        { _id: result._id },
        { $set: {
          duration,
          finish: infos.finish,
        } },
      );
      infos.sanction = 'mute_prolongation';
      message.channel.send(discordSuccess(cmdConfig.durationUpdated.replace('%u', victim).replace('%d', secondToDuration(duration)), message));
      SanctionManager.log(infos, guild);
      return;
    }

    // Ajout du rôle "Bailloné"
    try {
      await victim.roles.add(role);
    } catch (e) {
      message.channel.send(config.messages.errors.rolePermissions);
      logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
    }

    // Envoyer les messages
    const successMessage = cmdConfig.successfullyMuted
      .replace('%u', victim.user.username)
      .replace('%r', reason)
      .replace('%d', secondToDuration(duration));
    message.channel.send(discordSuccess(successMessage, message));

    // Envoyer les logs
    SanctionManager.addToHistory(infos);
    SanctionManager.addToSanctions(infos);
    SanctionManager.log(infos, guild);
  }

  static async warn(victim, reason, moderator, cmdConfig, message, guild) {
    // Envoyer les messages
    const date = Date.now();

    const successMessage = cmdConfig.successfullyWarned.replace('%u', victim.user.username).replace('%r', reason).replace('%d', date);
    message.channel.send(discordSuccess(successMessage, message));
    victim.send(cmdConfig.warning.replace('%u', victim.user.username).replace('%r', reason));

    // Vérifier s'il a dépasser la limite d'avertissement avant le banissement
    const result = await db.sanctionsHistory.findOne({ memberId: victim.id }).catch(console.error);
    if (result && result.currentWarnCount + 1 === config.moderation.warnLimitBeforeBan) {
      message.channel.send(cmdConfig.warnLimitReached);
      this.ban(victim, config.moderation.warnBanReason, config.moderation.warnBanTime, moderator, config.messages.commands.ban, message, guild);
    }

    // Envoyer les logs
    const infos = {
      sanction: 'warn',
      color: config.colors.warn,
      member: victim,
      mod: moderator,
      reason,
      id: date,
    };
    SanctionManager.addToHistory(infos, date);
    SanctionManager.log(infos, guild);
  }

  static async kick(victim, reason, moderator, cmdConfig, message, guild) {
    // Kick
    const hasBeenKicked = await victim.kick(reason).catch(error => void console.error(error)); // eslint-disable-line no-void

    if (!hasBeenKicked) return message.channel.send(discordError(cmdConfig.couldntKick, message));

    // Envoyer les messages
    const successMessage = cmdConfig.successfullyKicked.replace('%u', victim.user.username).replace('%r', reason);
    message.channel.send(discordSuccess(successMessage, message));

    // Envoyer les logs
    const infos = {
      sanction: 'kick',
      color: config.colors.kick,
      member: victim,
      mod: moderator,
      reason,
    };
    SanctionManager.addToHistory(infos);
    SanctionManager.log(infos, guild);
  }

  static async musicRestriction(requestedBy, moderator, music, logChannel, message) {
    // Regarde dans la bdd si le joueur est déjà interdit des commandes de musique
    const result = await db.sanctions.findOne({ member: requestedBy.id, sanction: 'music_restriction' }).catch(console.error);
    const infos = {
      color: config.bot.musicrestriction,
      member: requestedBy,
      mod: moderator,
      duration: 7 * 24 * 60 * 60, // 7 jours
      finish: Date.now() + 604800000,
      reason: `Musique inapropriée \`${music.title}\` (${music.video.shortURL})`,
    };

    // Si oui, alors on ralonge la restriction
    if (result) {
      await db.sanctions.update({ _id: result._id }, { $set: { finish: Date.now() + 604800000 } }).catch(console.error);
      infos.sanction = 'music_restriction_prolongation';

      SanctionManager.addToHistory(infos);
      SanctionManager.log(infos, message.guild, result);

      logChannel.send(':warning: **Cet utilisateur a déjà une restriction de musique, elle à donc été ralongée.**');
    } else {
      // Si non, alors on lui interdits les commandes de musique
      MusicBot.restricted.push(requestedBy.id);
      infos.sanction = 'music_restriction';

      SanctionManager.addToHistory(infos);
      SanctionManager.addToSanctions(infos);
      SanctionManager.log(infos, message.guild);
    }
  }

  static async unban(victim, reason, moderator, cmdConfig, message, guild) {
    // Regarde dans la bdd si le joueur est banni
    const result = await db.sanctions.findOne({ member: victim.id, sanction: 'ban' }).catch(console.error);
    if (!result) return message.channel.send(discordError(cmdConfig.notBanned.replace('%u', victim), message));
    if (!message.member.roles.cache.has(config.roles.owner) && result.modid !== message.author.id) return message.channel.send(discordError(cmdConfig.notYou, message));

    const channelName = `${config.moderation.banChannelPrefix}${prunePseudo(victim)}`;
    const chan = guild.channels.cache.find(c => c.name === channelName && c.type === 'text');
    let file;

    if (chan) {
      const allMessages = await SanctionManager.getAllMessages(chan);
      const originalModerator = message.guild.members.cache.get(result.modid);
      file = SanctionManager.getMessageHistoryFile({ victim, moderator: originalModerator, reason: result.reason }, allMessages);

      chan.delete();
    }

    const successMessage = cmdConfig.successfullyUnbanned
      .replace('%u', victim.user.username)
      .replace('%r', reason);
    message.channel.send(discordSuccess(successMessage, message));

    SanctionManager.addToHistory({
      member: victim,
      mod: moderator,
      sanction: 'unban',
      reason,
    });
    SanctionManager.removeSanction({
      member: victim,
      title: 'Nouveau cas :',
      mod: moderator,
      sanction: 'ban',
      reason,
      id: result._id,
      file,
    }, guild, message.channel);
  }

  static async unmute(victim, reason, moderator, cmdConfig, message, guild) {
    // Regarde dans la database si le joueur est mute
    const result = await db.sanctions.findOne({ member: victim.id, sanction: 'mute' }).catch(console.error);

    if (!result) return message.channel.send(discordError(cmdConfig.notMuted.replace('%u', victim), message));
    if (result.modid !== message.author.id) return message.channel.send(discordError(cmdConfig.notYou, message));

    const successMessage = cmdConfig.successfullyUnmuted
      .replace('%u', victim.user.username)
      .replace('%r', reason);
    message.channel.send(discordSuccess(successMessage, message));

    SanctionManager.addToHistory({
      member: victim,
      mod: moderator,
      sanction: 'unmute',
      reason,
    });
    SanctionManager.removeSanction({
      member: victim,
      title: 'Nouveau cas :',
      mod: moderator,
      sanction: 'mute',
      id: result._id,
      reason,
    }, guild, message.channel);
  }

  static async removeWarn(victim, id, reason, moderator, cmdConfig, message, guild) {
    // Regarde dans la database si le warn existe
    const userHistory = await db.sanctionsHistory.findOne({ memberId: victim.id }).catch(console.error);
    if (!userHistory) return message.channel.send(discordError(cmdConfig.noSanction.replace('%u', victim), message));

    const warn = userHistory.sanctions.find(elt => elt.type === 'warn' && elt.date.toString() === id);
    if (!warn) return message.channel.send(discordError(cmdConfig.notWarned.replace('%u', victim).replace('%d', id), message));
    if (userHistory.revokedWarns.includes(warn.date.toString())) return message.channel.send(discordError(cmdConfig.alreadyRevoked, message));
    if (warn.mod !== message.author.id) return message.channel.send(discordError(cmdConfig.notYou, message));

    const successMessage = cmdConfig.successfullyUnwarned
      .replace('%u', victim.user.username)
      .replace('%d', id)
      .replace('%r', reason);
    message.channel.send(discordSuccess(successMessage, message));

    SanctionManager.addToHistory({
      member: victim,
      mod: moderator,
      sanction: 'unwarn',
      id,
      reason,
    });
    await db.sanctionsHistory.update(
      { memberId: victim.id },
      {
        $inc: { currentWarnCount: -1 },
        $push: { revokedWarns: id.toString() },
      },
    ).catch(console.error);

    const embed = new MessageEmbed()
      .setColor(config.colors.success)
      .setTitle('Nouveau cas :')
      .setTimestamp()
      .addField(':bust_in_silhouette: Utilisateur', `${victim.toString()}\n(${victim.id})`, true)
      .addField(':cop: Modérateur', `${warn.mod.toString()}\n(${warn.mod.id})`, true)
      .addField(':tools: Action', "Suppression d'un avertissement", true)
      .addField(':label: Raison', `${reason}\nID du warn : ${id}`, true);
    guild.channels.cache.get(config.channels.logs).send(embed);
  }

  static async removeMusicRestriction(victim, reason, moderator, cmdConfig, message, guild) {
    // Regarde dans la database si le joueur est interdit des commandes de musique
    const result = await db.sanctions.findOne({ member: victim.id, sanction: 'music_restriction' }).catch(console.error);

    if (!result) return message.channel.send(discordError(cmdConfig.notRestricted.replace('%u', victim), message));

    const successMessage = cmdConfig.successfullyRemoveRestr
      .replace('%u', `${victim.user.username}`)
      .replace('%r', reason);
    message.channel.send(discordSuccess(successMessage, message));

    const index = MusicBot.restricted.indexOf(victim.id);
    MusicBot.restricted.splice(index, 1);

    SanctionManager.addToHistory({
      member: victim,
      mod: moderator,
      sanction: 'remove_music_restriction',
      reason,
    });
    SanctionManager.removeSanction({
      member: victim,
      title: 'Nouveau cas :',
      mod: moderator,
      sanction: 'music_restriction',
      id: result._id,
      reason,
    }, guild);
  }
}

client.on('guildMemberRemove', async (member) => {
  if (await SanctionManager.isBan(member.id)) Moderation.hardBan(member, config.messages.miscellaneous.hardBanAutomatic, client.user);
});

export default Moderation;
