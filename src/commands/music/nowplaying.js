import { MessageEmbed } from 'discord.js';
import Command from '../../helpers/Command';
import { modLog, sendLog } from '../../helpers/Moderation';
import MusicBot from '../../music';
import { config, db } from '../../main';
import { formatDate, padNumber } from '../../utils';

const PROGRESS_BAR_SIZE = 30;

class NowPlaying extends Command {
  constructor() {
    super('Now Playing');
    this.aliases = ['np', 'nowplaying', 'now-playing', 'now_playing'];
    this.usage = 'nowplaying';
    this.examples = ['nowplaying', 'np', 'music-info'];
    this.activeInHelpChannels = false;
  }

  async execute(message, _args) {
    if (!MusicBot.dispatcher || !MusicBot.nowPlaying) return message.channel.send(config.messages.errors.music[3]);

    const music = MusicBot.nowPlaying;

    const startAt = new Date(MusicBot.dispatcher.startTime).getTime();
    const elapsed = new Date(Date.now() - startAt);

    const minutes = elapsed.getMinutes() ? padNumber(elapsed.getMinutes()) : '00';
    const seconds = elapsed.getSeconds() ? padNumber(elapsed.getSeconds()) : '00';
    const duration = `${minutes}:${seconds} / ${music.duration}`;

    const progressBar = new Array(PROGRESS_BAR_SIZE).fill('▬');
    const cursorPos = Math.round((PROGRESS_BAR_SIZE / (music.video.durationSeconds * 1000)) * elapsed.getTime());
    progressBar[cursorPos] = '🔘';

    const embed = new MessageEmbed()
      .setAuthor('Actuellement en train de jouer :', config.avatar)
      .setTitle(music.title)
      .setURL(music.video.shortURL)
      .setDescription(`\n \`${progressBar.join('')}\` ${duration} \n\nAjoutée sur YouTube ${formatDate(new Date(music.video.publishedAt).getTime())} \n\nEn train de jouer dans le canal : \`${message.guild.voice.connection.channel.name}\`\n\nMusique demandée par : ${music.requestedBy.toString()}\n`)
      .setThumbnail(music.video.thumbnails.medium.url)
      .setColor(config.colors.default)
      .setFooter(`Éxécuté par ${message.author.username}. Réagissez avec ⚠️ pour signaler cette musique`)
      .setTimestamp();

    const users = { requestedBy: music.requestedBy, reportedBy: undefined, moderator: undefined };
    const playingEmbed = await message.channel.send(embed);

    await playingEmbed.react('👍');
    await playingEmbed.react('👎');

    playingEmbed
      .createReactionCollector((_reaction, _user) => {
        users.reportedBy = _user;
        return message.guild.voice.connection && !_user.bot && message.guild.voice.connection.channel.members.has(_user.id);
      }).on('collect', async (reaction) => {
        if (reaction.emoji.name === '⚠') {
          this.report(message, users, music);
        } else if (reaction.emoji.name === '👍' || reaction.emoji.name === '👎') {
          this.like(message, playingEmbed, reaction.emoji.name === '👍' ? 'like' : 'dislike', users, music);
        }
      });
  }

  async updateDbAsync(database, query, update, options = { returnUpdatedDocs: true }) {
    return new Promise((resolve, reject) => {
      database.update(query, update, options, (err, _numReplaced, affectedDocuments, _upsert) => {
        if (err) reject(err);
        else resolve(affectedDocuments);
      });
    });
  }

  async report(message, users, music) {
    message.channel.send(this.config.successfullyReported);
    const reportedBy = await message.guild.members.fetch(users.reportedBy);
    const logEmbed = new MessageEmbed()
      .setColor(config.colors.log)
      .setTitle('Rapport de musique :')
      .setTimestamp()
      .addField(':bust_in_silhouette: Utilisateur', `${users.requestedBy.toString()}\n(${users.requestedBy.id})`, true)
      .addField(':persevere: Plaignant', `${reportedBy.toString()}\n(${users.reportedBy.id})`, true)
      .addField(':musical_note: Musique', `[${music.title}](${music.video.shortURL})\nID de la musique : ${music.video.id}`, true)
      .addField('Informations', 'Réagissez avec :minidisc: pour ajouter la musique à la blacklist.\nRéagisser avec :tv: pour ajouter la chaîne YouTube à la blacklist.\nRéagissez avec :bust_in_silhouette: pour empêcher le joueur d\'ajouter une musique à la queue pendant 1 semaine');

    const logChannel = message.guild.channels.find(c => c.name === config.moderation.log.channelName && c.type === 'text');
    const logMessage = await logChannel.send(logEmbed);
    logMessage.react('💽');
    logMessage.react('📺');
    logMessage.react('👤');
    logMessage.react('❌');

    logMessage
      .createReactionCollector((reaction, user) => {
        users.moderator = user; // eslint-disable-line no-param-reassign
        return !user.bot && (reaction.emoji.name === '👤' || reaction.emoji.name === '💽' || reaction.emoji.name === '📺');
      }).on('collect', (reaction) => {
        switch (reaction.emoji.name) { // eslint-disable-line default-case
          case '💽':
            this.blacklistMusic(users, music, logChannel);
            break;
          case '📺':
            this.blacklistChannel(users, music, logChannel);
            break;
          case '👤':
            this.restrictUser(users, music, logChannel, message);
            break;
          case '❌':
            logMessage.delete();
            break;
        }
      });
  }

  async like(message, playingEmbed, type, users, music) {
    const foundTrack = await new Promise((resolve, reject) => {
      db.musicsStats.findOne({ ytid: music.video.id }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });

    const userId = users.reportedBy.id;
    let updated = false;
    if (foundTrack !== null) {
      if (foundTrack.likes.includes(userId) && type === 'like') {
        message.channel.send(this.config.alreadyLiked).then(msg => msg.delete({ timeout: 5000 }));
      } else if (foundTrack.dislikes.includes(userId) && type === 'dislike') {
        message.channel.send(this.config.alreadyDisliked).then(msg => msg.delete({ timeout: 5000 }));
      } else if (foundTrack.likes.includes(userId) && type === 'dislike') {
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $pull: { likes: userId } }, {});
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $push: { dislikes: userId } }, {});
        // Collection des utilisateurs ayant mis la réaction 👍
        const likers = playingEmbed.reactions.find(reaction => reaction.emoji.name === '👍').users;
        if (typeof likers.get(message.author.id) !== 'undefined') {
          likers.remove(message.author);
        }
        updated = true;
      } else if (foundTrack.dislikes.includes(userId) && type === 'like') {
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $pull: { dislikes: userId } }, {});
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $push: { likes: userId } }, {});
        // Collection des utilisateurs ayant mis la réaction 👎
        const dislikers = playingEmbed.reactions.find(reaction => reaction.emoji.name === '👎').users;
        if (typeof dislikers.get(message.author.id) !== 'undefined') {
          dislikers.remove(message.author);
        }
        updated = true;
      } else if (type === 'like') {
        db.musicsStats.update({ _id: foundTrack._id }, { $push: { likes: userId } });
        updated = true;
      } else if (type === 'dislike') {
        db.musicsStats.update({ _id: foundTrack._id }, { $push: { dislikes: userId } });
        updated = true;
      }
      if (updated) {
        db.musicsStats.loadDatabase(); // Rechargement, pour supprimer la duplication que `update` a créée
        message.channel.send(type === 'like' ? this.config.liked : this.config.disliked).then(msg => msg.delete({ timeout: 5000 }));
      }
    }
  }

  blacklistMusic(users, music, logChannel) {
    db.musics.findOne({ blacklist: true, type: 'music', ytid: music.video.id }, (err, result) => {
      if (err) console.error(err);

      if (result) return logChannel.send(':warning: **Cette musique est déjà blacklist !**');
      MusicBot.blacklistedMusics.push(music.video.id);
      db.musics.insert({
        blacklist: true,
        type: 'music',
        ytid: music.video.id,
        moderator: users.moderator.id,
        requestedBy: users.requestedBy.id,
        reportedBy: users.reportedBy.id,
      });

      const logBlacklistEmbed = new MessageEmbed()
        .setColor(config.colors.blacklist)
        .setTitle('Blacklist de musique :')
        .setTimestamp()
        .addField(':bust_in_silhouette: Utilisateur', `${users.requestedBy.toString()}\n(${users.requestedBy.id})`, true)
        .addField(':persevere: Plaignant', `${users.reportedBy.toString()}\n(${users.reportedBy.id})`, true)
        .addField(':cop: Modérateur', `${users.moderator.toString()}\n(${users.moderator.id})`, true)
        .addField(':musical_note: Musique', `[${music.title}](${music.video.shortURL})\nID de la musique : ${music.video.id}`, true);
      return logChannel.send(logBlacklistEmbed);
    });
  }

  blacklistChannel(users, music, logChannel) {
    db.musics.findOne({ blacklist: true, type: 'channel', ytid: music.video.channel.id }, (err, result) => {
      if (err) console.error(err);

      if (result) return logChannel.send(':warning: **Cette chaîne est déjà blacklist !**');
      MusicBot.blacklistedChannels.push(music.video.channel.id);
      db.musics.insert({
        blacklist: true,
        type: 'channel',
        ytid: music.video.channel.id,
        moderator: users.moderator.id,
        requestedBy: users.requestedBy.id,
        reportedBy: users.reportedBy.id,
      });

      const logBlacklistEmbed = new MessageEmbed()
        .setColor(config.colors.blacklist)
        .setTitle('Blacklist de chaîne YT :')
        .setTimestamp()
        .addField(':bust_in_silhouette: Utilisateur', `${users.requestedBy.toString()}\n(${users.requestedBy.id})`, true)
        .addField(':persevere: Plaignant', `${users.reportedBy.toString()}\n(${users.reportedBy.id})`, true)
        .addField(':cop: Modérateur', `${users.moderator.toString()}\n(${users.moderator.id})`, true)
        .addField(':tv: Chaîne', `[${music.video.channel.title}](${music.video.channel.url})\nID de la chaîne : ${music.video.channel.id}`, true);
      return logChannel.send(logBlacklistEmbed);
    });
  }

  restrictUser(users, music, logChannel, message) {
    db.sanctions.findOne({ member: music.requestedBy.id, sanction: 'music_restriction' }, (err, result) => {
      if (err) console.error(err);

      if (result) {
        db.sanctions.update({ _id: result._id }, { finish: Date.now() + 604800000 });
        const infos = {
          sanction: 'music_restriction_prolongation',
          color: config.bot.musicrestriction,
          member: users.requestedBy,
          mod: users.moderator,
          duration: 604800, // 7 jours
          finish: Date.now() + 604800000,
          reason: `Musique inapropriée ${music.title} : ${music.video.shortURL}`,
        };
        sendLog(infos, message.guild, result);
        logChannel.send(':warning: **Cet utilisateur a déjà une restriction de musique, elle à donc été ralongée.**');
      } else {
        MusicBot.restricted.push(users.requestedBy.id);
        modLog({
          log: true,
          sanction: 'music_restriction',
          color: config.colors.musicrestriction,
          member: users.requestedBy,
          mod: users.moderator,
          duration: 604800, // 7 jours
          finish: Date.now() + 604800000,
          reason: `Musique inapropriée \`${music.title}\` (${music.video.shortURL})`,
        }, message.guild);
      }
    });
  }
}

export default NowPlaying;
