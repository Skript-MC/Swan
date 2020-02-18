import { MessageEmbed } from 'discord.js';
import Command from '../../helpers/Command';
import MusicBot from '../../helpers/music';
import { config, db } from '../../main';
import { formatDate, padNumber } from '../../utils';
import { discordError } from '../../helpers/messages';
import ModerationBot from '../../helpers/moderation';

const PROGRESS_BAR_SIZE = 30;

class NowPlaying extends Command {
  constructor() {
    super('Now Playing');
    this.aliases = ['np', 'nowplaying', 'now-playing', 'now_playing'];
    this.usage = 'nowplaying';
    this.examples = ['nowplaying', 'np', 'music-info'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, _args) {
    if (!MusicBot.dispatcher || !MusicBot.nowPlaying) return message.channel.send(config.messages.errors.music[3]);

    const music = MusicBot.nowPlaying;

    const users = { requestedBy: music.requestedBy, reportedBy: undefined, moderator: undefined };
    const embed = await this.buildEmbed(message);
    const playingEmbed = await message.channel.send(embed);

    await playingEmbed.react('👍');
    await playingEmbed.react('👎');
    await playingEmbed.react('🔄');

    playingEmbed
      .createReactionCollector((_reaction, user) => {
        users.reportedBy = user;
        return message.guild.voice.connection && !user.bot && message.guild.voice.connection.channel.members.has(user.id);
      }).on('collect', async (reaction) => {
        if (reaction.emoji.name === '⚠️') {
          this.report(message, users, music);
        } else if (reaction.emoji.name === '👍' || reaction.emoji.name === '👎') {
          this.like(message, playingEmbed, reaction.emoji.name === '👍' ? 'like' : 'dislike', users, music);
        } else if (reaction.emoji.name === '🔄') {
          const reactionUsers = await reaction.users.fetch();
          for (const user of reactionUsers.array()) {
            if (user.bot) continue;
            reaction.users.remove(user);
          }

          if (MusicBot.nowPlaying) {
            playingEmbed.edit(await this.buildEmbed(message));
          } else {
            playingEmbed.edit(discordError('Plus de musique en train de jouer ni de musique dans la queue !', message));
          }
        }
      });
  }

  async buildEmbed(message) {
    const music = MusicBot.nowPlaying;

    const startAt = new Date(MusicBot.dispatcher.startTime).getTime();
    const elapsed = new Date(Date.now() - startAt);

    const minutes = elapsed.getMinutes() ? padNumber(elapsed.getMinutes()) : '00';
    const seconds = elapsed.getSeconds() ? padNumber(elapsed.getSeconds()) : '00';
    const duration = `${minutes}:${seconds} / ${music.duration}`;

    const progressBar = new Array(PROGRESS_BAR_SIZE).fill('▬');
    const cursorPos = Math.round((PROGRESS_BAR_SIZE / (music.video.durationSeconds * 1000)) * elapsed.getTime());
    progressBar[cursorPos] = '🔘';

    const track = await new Promise((resolve, reject) => {
      db.musicsStats.findOne({ ytid: music.video.id }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
    const likes = track.likes.length;
    const dislikes = track.dislikes.length;

    const description = `
    \`${progressBar.join('')}\` ${duration}
    
    Ajoutée sur YouTube ${formatDate(new Date(music.video.publishedAt).getTime())}
    
    En train de jouer dans le canal : \`${message.guild.voice.connection.channel.name}\`
    
    Musique demandée par : ${music.requestedBy.toString()}

    ${likes} 👍 / ${dislikes} 👎`;

    return new MessageEmbed()
      .setAuthor('Actuellement en train de jouer :', config.avatar)
      .setTitle(music.title)
      .setURL(music.video.shortURL)
      .setDescription(description)
      .setThumbnail(music.video.thumbnails.medium.url)
      .setColor(config.colors.default)
      .setFooter(`Exécuté par ${message.author.username}. Réagissez avec ⚠️ pour signaler cette musique`)
      .setTimestamp();
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

    const logChannel = message.guild.channels.cache.get(config.channels.logs);
    const logMessage = await logChannel.send(logEmbed);
    logMessage.react('💽');
    logMessage.react('📺');
    logMessage.react('👤');

    logMessage
      .createReactionCollector((reaction, user) => {
        users.moderator = user; // eslint-disable-line no-param-reassign
        return !user.bot && ['👤', '💽', '📺'].includes(reaction.emoji.name);
      }).on('collect', (reaction) => {
        switch (reaction.emoji.name) { // eslint-disable-line default-case
          case '💽':
            this.blacklistMusic(users, music, logChannel);
            break;
          case '📺':
            this.blacklistChannel(users, music, logChannel);
            break;
          case '👤':
            ModerationBot.musicRestriction(users.requestedBy, users.moderator, music, logChannel, message);
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
        // Déjà like (la réaction est déjà mise)
        message.channel.send(this.config.alreadyLiked).then(msg => msg.delete({ timeout: 5000 }));
      } else if (foundTrack.dislikes.includes(userId) && type === 'dislike') {
        // Déjà dislike (la réaction est déjà mise)
        message.channel.send(this.config.alreadyDisliked).then(msg => msg.delete({ timeout: 5000 }));
      } else if (foundTrack.likes.includes(userId) && type === 'dislike') {
        // On a like et on veut dislike
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $pull: { likes: userId } }, {});
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $push: { dislikes: userId } }, {});

        // Collection des utilisateurs ayant mis la réaction 👍
        const likers = playingEmbed.reactions.cache.find(reaction => reaction.emoji.name === '👍').users;
        if (typeof likers.cache.get(message.author.id) !== 'undefined') likers.remove(message.author);

        updated = true;
      } else if (foundTrack.dislikes.includes(userId) && type === 'like') {
        // On a dislike et on veut like
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $pull: { dislikes: userId } }, {});
        await this.updateDbAsync(db.musicsStats, { _id: foundTrack._id }, { $push: { likes: userId } }, {});

        // Collection des utilisateurs ayant mis la réaction 👎
        const dislikers = playingEmbed.reactions.cache.find(reaction => reaction.emoji.name === '👎').users;
        if (typeof dislikers.cache.get(message.author.id) !== 'undefined') dislikers.remove(message.author);

        updated = true;
      } else if (type === 'like') {
        // On veut like
        db.musicsStats.update({ _id: foundTrack._id }, { $push: { likes: userId } });
        updated = true;
      } else if (type === 'dislike') {
        // On veut dislike
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
}

export default NowPlaying;
