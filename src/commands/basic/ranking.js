import { MessageEmbed } from 'discord.js';
import Youtube from 'simple-youtube-api';
import Command from '../../helpers/Command';
import { db, config } from '../../main';
import { discordError } from '../../helpers/messages';

require('dotenv').config();

const youtubeAPI = process.env.YOUTUBE_API;
const youtube = new Youtube(youtubeAPI);

const emojis = [':one:', ':two:', ':three:', ':four:', ':five:'];

class Ranking extends Command {
  constructor() {
    super('Ranking');
    this.aliases = ['ranking', 'rank', 'ranks', 'classement'];
    this.usage = 'ranking <music-likes/music-dislikes/music-views/credits>';
    this.examples = ['classement music-views', 'ranks credits'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.send(discordError(this.config.noType, message));

    let description = '';
    let type = '';

    switch (args[0]) {
      case 'credits':
      case 'credit':
      case 'crédit':
      case 'crédits': {
        type = 'crédits';
        const topCredits = await this.getTopCredit(3);

        for (const [i, element] of topCredits.entries()) {
          const member = message.guild.members.cache.get(element.member);
          description += `    ${emojis[i]} ${member.nickname || member.user.username} : ${element.credits}\n`;
        }
        break;
      }
      case 'musique-like':
      case 'music-like':
      case 'musique-likes':
      case 'music-likes': {
        type = 'musiques les plus likées';
        const topMusics = await this.getTopLikedMusic(5);

        if (topMusics) {
          for (const [i, music] of topMusics.entries()) {
            const video = await youtube.getVideoByID(music.ytid);
            description += `    ${emojis[i]} ${video.title} : ${music.likes.length}\n`;
          }
        }
        break;
      }
      case 'musique-dislike':
      case 'music-dislike':
      case 'musique-dislikes':
      case 'music-dislikes': {
        type = 'musiques les plus dislikées';
        const topMusics = await this.getTopDislikedMusic(5);

        if (topMusics) {
          for (const [i, music] of topMusics.entries()) {
            const video = await youtube.getVideoByID(music.ytid);
            description += `    ${emojis[i]} ${video.title} : ${music.dislikes.length}\n`;
          }
        }
        break;
      }
      case 'musique-view':
      case 'music-view':
      case 'musique-views':
      case 'music-views': {
        type = 'musiques les plus écoutées';
        const topMusics = await this.getTopSeenMusic(5);

        if (topMusics) {
          for (const [i, music] of topMusics.entries()) {
            const video = await youtube.getVideoByID(music.ytid);
            description += `    ${emojis[i]} ${video.title} : ${music.played}\n`;
          }
        }
        break;
      }
      default:
        message.channel.send(discordError(this.config.invalidType, message));
        return;
    }

    const embed = new MessageEmbed()
      .attachFiles([config.bot.avatar])
      .setColor(config.colors.default)
      .setAuthor(`Classement des ${type} :`, 'attachment://logo.png')
      .setDescription(description || 'Aucune donnée')
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();

    message.channel.send(embed);
  }

  async getTopCredit(n) {
    const top = await new Promise((resolve, reject) => {
      db.credits.find({}, (err, docs) => {
        if (err) reject(err);

        const sorted = docs.sort((a, b) => b.credits - a.credits);
        resolve(sorted.slice(0, n));
      });
    }).catch(console.error);
    return top;
  }

  async getTopLikedMusic(n) {
    const top = await new Promise((resolve, reject) => {
      db.musicsStats.find({}, (err, docs) => {
        if (err) reject(err);

        const musics = docs.filter(elt => elt.likes.length > 0);
        if (!musics) return resolve(null);

        const sorted = musics.sort((a, b) => b.likes.length - a.likes.length);
        return resolve(sorted.slice(0, n));
      });
    }).catch(console.error);
    return top;
  }

  async getTopDislikedMusic(n) {
    const top = await new Promise((resolve, reject) => {
      db.musicsStats.find({}, (err, docs) => {
        if (err) reject(err);

        const musics = docs.filter(elt => elt.dislikes.length > 0);
        if (!musics) return resolve(null);

        const sorted = musics.sort((a, b) => b.dislikes.length - a.dislikes.length);
        return resolve(sorted.slice(0, n));
      });
    }).catch(console.error);
    return top;
  }

  async getTopSeenMusic(n) {
    const top = await new Promise((resolve, reject) => {
      db.musicsStats.find({}, (err, docs) => {
        if (err) reject(err);

        const musics = docs.filter(elt => elt.played > 0);
        if (!musics) return resolve(null);

        const sorted = musics.sort((a, b) => b.played - a.played);
        return resolve(sorted.slice(0, n));
      });
    }).catch(console.error);
    return top;
  }
}

export default Ranking;
