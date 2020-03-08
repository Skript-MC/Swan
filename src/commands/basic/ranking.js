import { MessageEmbed } from 'discord.js';
import Youtube from 'simple-youtube-api';
import Command from '../../structures/Command';
import { db, config } from '../../main';
import { discordError } from '../../structures/messages';

require('dotenv').config();

const youtubeAPI = process.env.YOUTUBE_API;
const youtube = new Youtube(youtubeAPI);

const emojis = [':one:', ':two:', ':three:', ':four:', ':five:'];

class Ranking extends Command {
  constructor() {
    super('Ranking');
    this.aliases = ['ranking', 'rank', 'ranks', 'classement'];
    this.usage = 'ranking <music-likes/music-dislikes/music-views/joke-likes/joke-dislikes/joke-views>';
    this.examples = ['classement music-views', 'ranks music-dislikes', 'ranking joke-likes'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.send(discordError(this.config.noType, message));

    let description = '';
    let type = '';

    switch (args[0]) {
      // case 'credits':
      // case 'credit':
      // case 'crédit':
      // case 'crédits': {
      //   type = 'crédits';
      //   const topCredits = await this.getTopCredit(3);

      //   for (const [i, element] of topCredits.entries()) {
      //     const member = message.guild.members.cache.get(element.member);
      //     description += `    ${emojis[i]} ${member.nickname || member.user.username} : ${element.credits}\n`;
      //   }
      //   break;
      // }
      case 'blague-like':
      case 'joke-like':
      case 'blague-likes':
      case 'joke-likes': {
        type = 'blagues les plus likées';
        const topJokes = await this.getTopLikedJoke(5);

        if (topJokes) {
          for (const [i, joke] of topJokes.entries()) {
            const jokeDoc = config.messages.commands.joke.jokes[joke.id];
            const split = jokeDoc.split(';');
            description += `    ${emojis[i]} \`${split[0]}\` : ${joke.likes.length} 😄\n`;
          }
        }
        break;
      }
      case 'blague-dislike':
      case 'joke-dislike':
      case 'blague-dislikes':
      case 'joke-dislikes': {
        type = 'blagues les plus dislikées';
        const topJokes = await this.getTopDislikedJoke(5);

        if (topJokes) {
          for (const [i, joke] of topJokes.entries()) {
            const jokeDoc = config.messages.commands.joke.jokes[joke.id];
            const split = jokeDoc.split(';');
            description += `    ${emojis[i]} \`${split[0]}\` : ${joke.dislikes.length} 🙄\n`;
          }
        }
        break;
      }
      case 'blague-view':
      case 'joke-view':
      case 'blague-views':
      case 'joke-views': {
        type = 'blagues les plus vues';
        const topJokes = await this.getTopSeenJoke(5);

        if (topJokes) {
          for (const [i, joke] of topJokes.entries()) {
            const jokeDoc = config.messages.commands.joke.jokes[joke.id];
            const split = jokeDoc.split(';');
            description += `    ${emojis[i]} \`${split[0]}\` : ${joke.views} 👀\n`;
          }
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

  async getTopLikedJoke(n) {
    const docs = await db.jokes.find({}).catch(console.error);
    const jokes = docs.filter(elt => elt.likes.length > 0);
    if (!jokes) return null;

    const sorted = jokes.sort((a, b) => b.likes.length - a.likes.length);
    const top = sorted.slice(0, n);
    return top;
  }

  async getTopDislikedJoke(n) {
    const docs = await db.jokes.find({}).catch(console.error);
    const jokes = docs.filter(elt => elt.dislikes.length > 0);
    if (!jokes) return null;

    const sorted = jokes.sort((a, b) => b.dislikes.length - a.dislikes.length);
    const top = sorted.slice(0, n);
    return top;
  }

  async getTopSeenJoke(n) {
    const docs = await db.jokes.find({}).catch(console.error);
    const jokes = docs.filter(elt => elt.views > 0);
    if (!jokes) return null;

    const sorted = jokes.sort((a, b) => b.views - a.views);
    const top = sorted.slice(0, n);
    return top;
  }

  async getTopCredit(n) {
    const docs = await db.credits.find({}).catch(console.error);
    const sorted = docs.sort((a, b) => b.credits - a.credits);
    const top = sorted.slice(0, n);
    return top;
  }

  async getTopLikedMusic(n) {
    const docs = await db.musicsStats.find({}).catch(console.error);
    const musics = docs.filter(elt => elt.likes.length > 0);
    if (!musics) return null;

    const sorted = musics.sort((a, b) => b.likes.length - a.likes.length);
    const top = sorted.slice(0, n);
    return top;
  }

  async getTopDislikedMusic(n) {
    const docs = await db.musicsStats.find({}).catch(console.error);
    const musics = docs.filter(elt => elt.dislikes.length > 0);
    if (!musics) return null;

    const sorted = musics.sort((a, b) => b.dislikes.length - a.dislikes.length);
    const top = sorted.slice(0, n);
    return top;
  }

  async getTopSeenMusic(n) {
    const docs = await db.musicsStats.find({}).catch(console.error);
    const musics = docs.filter(elt => elt.played > 0);
    if (!musics) return null;

    const sorted = musics.sort((a, b) => b.played - a.played);
    const top = sorted.slice(0, n);
    return top;
  }
}

export default Ranking;
