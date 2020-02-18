/* eslint-disable import/no-cycle */
import fs from 'fs';
import { MessageEmbed } from 'discord.js';
import { success, discordSuccess, discordError } from './messages';
import { db, config, client } from '../main';
import { prunePseudo, secondToDuration, formatDate, padNumber } from '../utils';
import MusicBot from './music';

class ModerationBotApp {
  ban(victim, reason, duration, moderator, cmdConfig, message, guild) {
    const role = guild.roles.cache.find(r => r.name === config.moderation.banRole);

    // Vérifier dans la bdd si le joueur est déjà banni
    db.sanctions.find({ member: victim.id, sanction: 'ban' }, async (err, results) => {
      if (err) console.error(err);

      // Déjà un résultat dans la bdd
      if (results.length > 0) {
        return message.channel.send(discordError(cmdConfig.alreadyBanned.replace('%u', victim), message));
      }
      // Durée invalide
      if (duration < -1) {
        return message.channel.send(discordError(cmdConfig.invalidDuration, message));
      }
      // Durée max des modérateurs forum : 2h
      if (message.member.roles.cache.has(config.roles.forumMod) && (duration === -1 || duration > 7200)) {
        return message.channel.send(discordError(cmdConfig.durationTooLong));
      }

      // Créer un channel perso
      const pseudo = prunePseudo(victim);
      const channelName = `${config.moderation.banChannelPrefix}${pseudo}`;
      const chan = guild.channels.cache.find(c => c.name === channelName && c.type === 'text')
                || await this.createChannel(victim, moderator, channelName, guild);

      // Ajout du rôle "Sous-fiffre"
      try {
        victim.roles.add(role);
      } catch (e) {
        message.channel.send(discordError(cmdConfig.cantAddRole, message));
        console.error(e);
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
      this.addToHistory(infos);
      this.addToSanctions(infos);
      this.log(infos, guild);
    });
  }

  mute(victim, reason, duration, moderator, cmdConfig, message, guild) {
    const role = guild.roles.cache.find(r => r.name === config.moderation.muteRole);

    // Regarde dans la bdd si le joueur est déjà mute
    db.sanctions.find({ member: victim.id, sanction: 'mute' }, (err, results) => {
      if (err) console.error(err);

      // Déjà un résultat dans la bdd
      if (results.length > 0) {
        return message.channel.send(discordError(cmdConfig.alreadyMuted.replace('%u', victim), message));
      }
      // Durée invalide
      if (duration < -1) {
        return message.channel.send(discordError(cmdConfig.invalidDuration, message));
      }
      // Durée maximale des sanctions des modos forum : 2h
      if (message.member.roles.cache.has(config.roles.forumMod) && (duration !== -1 || duration > 7200)) {
        return message.channel.send(discordError(cmdConfig.durationTooLong, message));
      }

      // Ajout du rôle "Bailloné"
      try {
        victim.roles.add(role);
      } catch (e) {
        message.channel.send(discordError(cmdConfig.cantAddRole, message));
        console.error(e);
      }

      // Envoyer les messages
      const successMessage = cmdConfig.successfullyMuted
        .replace('%u', victim.user.username)
        .replace('%r', reason)
        .replace('%d', secondToDuration(duration));
      message.channel.send(discordSuccess(successMessage, message));

      // Envoyer les logs
      const infos = {
        sanction: 'mute',
        color: config.colors.mute,
        member: victim,
        mod: moderator,
        duration,
        finish: duration !== -1 ? Date.now() + duration * 1000 : -1,
        reason,
      };
      this.addToHistory(infos);
      this.addToSanctions(infos);
      this.log(infos, guild);
    });
  }

  warn(victim, reason, moderator, cmdConfig, message, guild) {
    // Envoyer les messages
    const successMessage = cmdConfig.successfullyWarned.replace('%u', victim.user.username).replace('%r', reason);
    message.channel.send(discordSuccess(successMessage, message));
    victim.send(cmdConfig.warning.replace('%u', victim.user.username).replace('%r', reason));

    // Vérifier s'il a dépasser la limite d'avertissement avant le banissement
    db.sanctionsHistory.findOne({ memberId: victim.id }, async (err, result) => {
      if (err) console.error(err);

      if (result.currentWarnCount + 1 === config.moderation.warnLimitBeforeBan) {
        message.channel.send(cmdConfig.warnLimitReached);
        this.ban(victim, config.moderation.warnBanReason, config.moderation.warnBanTime, moderator, config.messages.commands.ban, message, guild);
      }
    });

    // Envoyer les logs
    const infos = {
      sanction: 'warn',
      color: config.colors.warn,
      member: victim,
      mod: moderator,
      reason,
    };
    this.addToHistory(infos);
    this.log(infos, guild);
  }

  musicRestriction(requestedBy, moderator, music, logChannel, message) {
    // Regarde dans la bdd si le joueur est déjà interdit des commandes de musique
    db.sanctions.findOne({ member: requestedBy.id, sanction: 'music_restriction' }, (err, result) => {
      if (err) console.error(err);

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
        db.sanctions.update({ _id: result._id }, { $set: { finish: Date.now() + 604800000 } });
        infos.sanction = 'music_restriction_prolongation';

        this.addToHistory(infos);
        this.log(infos, message.guild, result);

        logChannel.send(':warning: **Cet utilisateur a déjà une restriction de musique, elle à donc été ralongée.**');
      } else {
        // Si non, alors on lui interdits les commandes de musique
        MusicBot.restricted.push(requestedBy.id);
        infos.sanction = 'music_restriction';

        this.addToHistory(infos);
        this.addToSanctions(infos);
        this.log(infos, message.guild);
      }
    });
  }

  unban(victim, reason, moderator, cmdConfig, message, guild) {
    // Regarde dans la bdd si le joueur est banni
    db.sanctions.findOne({ member: victim.id, sanction: 'ban' }, async (err, result) => {
      if (err) console.error(err);

      if (!result) return message.channel.send(discordError(cmdConfig.notBanned.replace('%u', victim), message));
      if (!message.member.roles.cache.has(config.roles.owner) && result.modid !== message.author.id) return message.channel.send(discordError(cmdConfig.notYou, message));

      const channelName = `${config.moderation.banChannelPrefix}${prunePseudo(victim)}`;
      const chan = guild.channels.cache.find(c => c.name === channelName && c.type === 'text');
      let file;

      if (chan) {
        const allMessages = await this.getAllMessages(chan);
        const originalModerator = message.guild.members.cache.get(result.modid);
        file = this.getMessageHistoryFile({ victim, moderator: originalModerator, reason: result.reason }, allMessages);

        chan.delete();
      }

      const successMessage = cmdConfig.successfullyUnbanned
        .replace('%u', victim.user.username)
        .replace('%r', reason);
      message.channel.send(discordSuccess(successMessage, message));

      this.addToHistory({
        member: victim,
        mod: moderator,
        sanction: 'unban',
        reason,
      });
      this.removeSanction({
        member: victim,
        title: 'Nouveau cas :',
        mod: moderator,
        sanction: 'ban',
        reason,
        id: result._id,
        file,
      }, guild);
    });
  }

  unmute(victim, reason, moderator, cmdConfig, message, guild) {
    // Regarde dans la database si le joueur est mute
    db.sanctions.findOne({ member: victim.id, sanction: 'mute' }, (err, result) => {
      if (err) console.error(err);

      if (!result) return message.channel.send(discordError(cmdConfig.notMuted.replace('%u', victim), message));
      if (result.modid !== message.author.id) return message.channel.send(discordError(cmdConfig.notYou, message));

      const successMessage = cmdConfig.successfullyUnmuted
        .replace('%u', victim.user.username)
        .replace('%r', reason);
      message.channel.send(discordSuccess(successMessage, message));

      this.addToHistory({
        member: victim,
        mod: moderator,
        sanction: 'unmute',
        reason,
      });

      this.removeSanction({
        member: victim,
        title: 'Nouveau cas :',
        mod: moderator,
        sanction: 'mute',
        id: result._id,
        reason,
      }, guild);
    });
  }

  removeMusicRestriction(victim, reason, moderator, cmdConfig, message, guild) {
    // Regarde dans la database si le joueur est interdit des commandes de musique
    db.sanctions.findOne({ member: victim.id, sanction: 'music_restriction' }, (err, result) => {
      if (err) console.error(err);

      if (!result) return message.channel.send(discordError(cmdConfig.notRestricted.replace('%u', victim), message));

      const successMessage = cmdConfig.successfullyRemoveRestr
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason);
      message.channel.send(discordSuccess(successMessage, message));

      const index = MusicBot.restricted.indexOf(victim.id);
      MusicBot.restricted.splice(index, 1);

      this.addToHistory({
        member: victim,
        mod: moderator,
        sanction: 'remove_music_restriction',
        reason,
      });
      this.removeSanction({
        member: victim,
        title: 'Nouveau cas :',
        mod: moderator,
        sanction: 'music_restriction',
        id: result._id,
        reason,
      }, guild);
    });
  }

  getMember(message, arg) {
    return message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(arg);
  }

  async createChannel(victim, moderator, channelName, guild) {
    let channel;
    try {
      channel = await guild.channels.create(channelName, 'text');
      channel.setParent(config.moderation.logCategory);
      channel.setTopic(`Canal privé suite au bannissement de ${victim.user.username}, par ${moderator.username}`);
      await channel.overwritePermissions({
        reason: `Création du canal perso de ${victim.user.username}. (banni)`,
        permissionOverwrites: [
          {
            id: config.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          }, {
            id: config.roles.staff,
            deny: ['MANAGE_CHANNELS'],
            allow: ['VIEW_CHANNEL'],
          }, {
            id: moderator.id,
            allow: ['MANAGE_CHANNELS'],
          }, {
            id: victim.id,
            allow: ['VIEW_CHANNEL'],
          },
        ],
      });
    } catch (e) {
      console.error('Error while attempting to create the channel :');
      console.error(e);
    }
    return channel;
  }

  async addToHistory(info) {
    db.sanctionsHistory.findOne({ memberId: info.member.user.id }, async (err, result) => {
      if (err) console.error(err);

      // Si le membre n'a pas d'historique, on créé un document
      if (!result) {
        const document = {
          memberId: info.member.user.id,
          sanctions: [],
          count: 0,
          currentWarnCount: 0,
        };
        // eslint-disable-next-line no-param-reassign
        result = await new Promise((resolve, reject) => {
          db.sanctionsHistory.insert(document, (err2, newDoc) => {
            if (err) reject(err2);
            else resolve(newDoc);
          });
        }).catch(console.error);
      }

      // On ajoute la sanction à l'historique
      const count = result.count + 1;
      const sanction = {
        type: info.sanction,
        mod: info.mod.id,
        date: Date.now(),
      };
      if (info.reason) sanction.reason = info.reason;
      if (info.duration) sanction.duration = info.duration;

      db.sanctionsHistory.update({ _id: result._id }, { $push: { sanctions: sanction } }, {}, (err2) => {
        if (err2) console.error(err2);
      });
      db.sanctionsHistory.update({ _id: result._id }, { $set: { count } }, {}, (err2) => {
        if (err2) console.error(err2);
      });

      // Si c'est un avertissement, on met à jour le nombre d'avertissement avant sanction
      if (info.sanction === 'warn') {
        let currentWarnCount = result ? result.currentWarnCount + 1 : 1;
        if (currentWarnCount >= config.moderation.warnLimitBeforeBan) currentWarnCount = 0;
        db.sanctionsHistory.update({ _id: result._id }, { $set: { currentWarnCount } }, {}, (err2) => {
          if (err2) console.error(err2);
        });
      }
    });
  }

  addToSanctions(info) {
    db.sanctions.insert({
      sanction: info.sanction,
      reason: info.reason,
      member: info.member.id,
      modid: info.mod.id,
      start: Date.now(),
      duration: info.duration || 0,
      finish: info.finish,
    });
  }

  log(infos, guild) {
    let action;
    if (infos.sanction === 'ban') action = 'Restriction du discord';
    else if (infos.sanction === 'hardban') action = 'Banissement';
    else if (infos.sanction === 'mute') action = "Mute des channels d'aide";
    else if (infos.sanction === 'warn') action = 'Avertissement';
    else if (infos.sanction === 'music_restriction') action = 'Restriction des commandes de musiques';
    else if (infos.sanction === 'music_restriction_prolongation') action = 'Prolongation de la restriction des commandes de musiques';

    // Création de l'embed
    const embed = new MessageEmbed()
      .setColor(infos.color)
      .setTitle('Nouveau cas :')
      .setTimestamp()
      .addField(':bust_in_silhouette: Utilisateur', `${infos.member.toString()}\n(${infos.member.id})`, true)
      .addField(':cop: Modérateur', `${infos.mod.toString()}\n(${infos.mod.id})`, true)
      .addField(':tools: Action', `${action}`, true);

    if (infos.finish && infos.duration && infos.finish !== -1) {
      embed.addField(':stopwatch: Durée', `${secondToDuration(infos.duration)}\nExpire ${formatDate(infos.finish)}`, true);
    } else if (infos.duration) {
      embed.addField(':stopwatch: Durée', `${secondToDuration(infos.duration)}`, true);
    }

    embed.addField(':label: Raison', `${infos.reason}`, true);
    if (infos.privateChannel) embed.addField(':speech_left: Channel privé', `${infos.privateChannel.toString()}`, true);

    const logChannel = guild.channels.cache.get(config.channels.logs);
    logChannel.send(embed);
  }

  removeSanction(info, guild) {
    db.sanctions.remove({ _id: info.id }, {}, (err) => {
      if (err) console.error(err);

      // On enlève le rôle de la victime
      const role = info.sanction === 'ban'
        ? guild.roles.cache.find(r => r.name === config.moderation.banRole)
        : guild.roles.cache.find(r => r.name === config.moderation.muteRole);

      if (info.member.roles.cache.has(role.id)) {
        try {
          info.member.roles.remove(role);
        } catch (e) {
          console.error(e);
        }
      }

      // On supprime le channel s'il y en a un
      const chan = guild.channels.cache.find(c => c.name === `${config.moderation.banChannelPrefix}${prunePseudo(info.member)}` && c.type === 'text');
      if (chan) chan.delete();

      // On envoie le message de log
      let action;
      if (info.sanction === 'ban') action = 'Unban';
      else if (info.sanction === 'mute') action = 'Unmute';
      else if (info.sanction === 'music_restriction') action = 'Suppression de la restriction des commandes de musiques';

      const logChannel = guild.channels.cache.get(config.channels.logs);
      const embed = new MessageEmbed()
        .setColor(config.colors.success)
        .setTitle(info.title)
        .setTimestamp()
        .addField(':bust_in_silhouette: Utilisateur', `${info.member.toString()}\n(${info.member.id})`, true)
        .addField(':cop: Modérateur', `${info.mod.toString()}\n(${info.mod.id})`, true)
        .addField(':tools: Action', `${action}`, true)
        .addField(':label: Raison', `${info.reason}\nID : ${info.id}`, true);
      if (info.file) embed.addField(':scroll: Historique des messages', 'Disponible ci-dessous', true);

      logChannel.send(embed);

      if (info.file) {
        logChannel.send({
          files: [{
            attachment: info.file.filePath,
            name: `${info.file.fileName}.txt`,
          }],
        });
      }
    });
  }

  isBan(id) {
    return new Promise((resolve, reject) => {
      db.sanctions.findOne({ member: id, sanction: 'ban' }, (err, result) => {
        if (err) reject(err);
        resolve(!!result); // Cast result en boolean. Donc si il y a un résultat : true, sinon : false
      });
    });
  }

  hardBan(member, ban) {
    // Ban
    if (ban) member.ban();

    // Suppression de la database
    db.sanctions.remove({ _id: member.id }, {}, (err) => {
      if (err) console.error(err);
    });

    // Suppression du channel perso
    const guild = client.guilds.cache.get(config.bot.guild);
    const chan = guild.channels.cache.find(c => c.name === `${config.moderation.banChannelPrefix}${prunePseudo(member)}` && c.type === 'text');
    if (chan) chan.delete();

    // Envoie d'un log
    this.log({
      sanction: 'hardban',
      color: '#000000',
      member,
      mod: client.user,
      reason: ban ? config.messages.miscellaneous.hardBanAutomatic : config.messages.miscellaneous.hardBanModerator,
    }, guild);
  }

  async getAllMessages(chan) {
    const allMessagesMapped = await chan.messages.fetch().catch(console.error);
    const allMessages = [];
    for (const elt of allMessagesMapped) {
      const infos = elt[1];
      allMessages.push({
        id: infos.id,
        content: infos.content,
        authorName: infos.author.username,
        sentAt: infos.createdTimestamp,
        edited: !!infos.editedTimestamp,
      });
    }
    allMessages.sort((a, b) => a.sentAt - b.sentAt);

    return allMessages;
  }

  getMessageHistoryFile(infos, messages) {
    let fileContent = `Historique des messages du salon du banni : ${infos.victim.user.username}. Modérateur en charge : ${infos.moderator.user.username}. Raison du banissement : ${infos.reason}.\n\n\nMessages :\n\n`;

    for (const message of messages) {
      const sentAt = new Date(message.sentAt);
      const sentAtFormatted = [
        padNumber(sentAt.getHours()),
        ':',
        padNumber(sentAt.getMinutes()),
        ':',
        padNumber(sentAt.getSeconds()),
        ' le ',
        padNumber(sentAt.getDate()),
        '/',
        padNumber(sentAt.getMonth() + 1),
        '/',
        sentAt.getFullYear(),
      ].join('');

      let line = `[${message.id}] (${sentAtFormatted}) ${message.authorName} : ${message.content}`;
      if (message.edited) line = `[Modifié] ${line}`;
      fileContent += `${line}\n`;
    }

    let fileName = prunePseudo(infos.victim);
    const path = `${__dirname}/../../databases/ban-logs/`;
    let i = 1;
    if (fs.existsSync(`${path}${fileName}.txt`)) {
      while (fs.existsSync(`${path}${fileName}-${i}.txt`)) {
        i++;
      }
      fileName += `-${i}`;
    }

    fs.writeFile(`${path}${fileName}.txt`, fileContent, (err) => {
      if (err) console.error(err);
    });

    return {
      filePath: `${path}${fileName}.txt`,
      fileName,
    };
  }
}

const ModerationBot = new ModerationBotApp();
success('ModerationBot loaded!');

client.on('ready', () => {
  const guild = client.guilds.resolve(config.bot.guild);
  if (!guild) return console.error('Aucune guilde n\'a été spécifiée dans le config.json. Il est donc impossible de vérifier si des sanctions ont expirées.');

  setInterval(() => {
    // Trouver tous les élements dont la propriété "finish" est inférieure ($lt) à maintenant et ($and) pas égale ($not) à -1 (=ban def)
    const query = {
      $and: [
        { finish: { $lt: Date.now() } },
        { $not: { finish: -1 } }],
    };
    db.sanctions.find(query, async (err, results) => {
      if (err) console.error(err);

      for (const result of results) {
        const victim = guild.members.cache.get(result.member);
        const channelName = `${config.moderation.banChannelPrefix}${prunePseudo(victim)}`;
        const chan = guild.channels.cache.find(c => c.name === channelName && c.type === 'text');

        const allMessages = await ModerationBot.getAllMessages(chan);
        const originalModerator = guild.members.cache.get(result.modid);
        const file = ModerationBot.getMessageHistoryFile({ victim, moderator: originalModerator, reason: result.reason }, allMessages);
        ModerationBot.removeSanction({
          member: guild.members.cache.get(result.member),
          title: 'Action automatique',
          mod: client.user,
          sanction: result.sanction,
          reason: 'Sanction expirée (automatique).',
          id: result._id,
          file,
        }, guild);
      }
    });
  }, config.bot.checkInterval);
});

client.on('guildMemberRemove', async (member) => {
  if (await ModerationBot.isBan(member.id)) ModerationBot.hardBan(member, true);
});

export default ModerationBot;
