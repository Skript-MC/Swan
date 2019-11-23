/* eslint-disable one-var-declaration-per-line */
/* eslint-disable one-var */
import he from 'he';
import { MessageEmbed } from 'discord.js';
import Youtube from 'simple-youtube-api';
import Command from '../../helpers/Command';
import MusicBot from '../../music';
import { config } from '../../main';
import { padNumber } from '../../utils';

require('dotenv').config();

const youtubeAPI = process.env.YOUTUBE_API;
const youtube = new Youtube(youtubeAPI);

const regexps = {
  playlist: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*\?(?:.*\b)?list=(.*)$/gimu,
  video: /^<?(?:https?:\/\/)?(?:www\.)?youtu(?:be)?(?:\.be|\.com)\/(.+)>?/gimu,
};

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
const queue = []; // Queue locale, avant d'être ajoutée à MusicBot.queue dans MusicBot.playSong()

class Play extends Command {
  constructor() {
    super('Play');
    this.aliases = ['play', 'jouer', 'joue'];
    this.usage = 'play [<musique [--first] | URL de musique youtube | URL de playlist youtube>]';
    this.examples = ['play darude sandstorm', 'play gangnamstyle --first', 'play https://youtu.be/y6120QOlsfU', 'play'];
    this.cooldown = 3000;
    this.activeInHelpChannels = false;
  }

  async execute(message, args) {
    // Si l'utilisateur est restreint des commandes de musiques
    if (MusicBot.restricted.includes(message.author.id)) return message.channel.send(this.config.restrictedUser);

    // Si l'utilisateur est dans un channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send(this.config.notInChannel);

    // Faire rejoindre le bot, s'il n'est pas déjà dans un canal vocal
    if (!message.guild.voice || !message.guild.voice.connection || message.guild.voice.channel.id !== message.member.voice.channel.id) {
      // Rejoindre le channel s'il n'est pas en train de jouer
      if (!MusicBot.nowPlaying) MusicBot.join(message);
      // Sinon on arrête
      else return message.channel.send(this.config.alreadyBusy.replace('%s', message.guild.voice.channel.name));
    }

    let query = args.length === 0 ? '' : args.join(' ');

    if (query === '') { // Aucun argument
      if (MusicBot.queue && MusicBot.queue.length > 0) MusicBot.playSong(MusicBot.queue, message);
      else message.channel.send(this.config.noArgumentGiven);
    } else if (query.match(regexps.playlist)) { // URL de Playlist YouTube
      let matches, playlist, videos;
      try {
        matches = Array.from(query.matchAll(regexps.playlist));
        playlist = await youtube.getPlaylistByID(matches[0][1]);
        videos = await playlist.getVideos(config.music.queueLimit);
      } catch (err) {
        console.error(err);
        return message.channel.send(this.config.playlistNotFound);
      }

      let blocked = 0;
      for (const vid of videos) {
        const video = vid.fetch();
        if (MusicBot.blacklistedMusics.includes(video.id) || MusicBot.blacklistedChannels.includes(video.channel.id)) {
          blocked++;
          continue;
        }

        const url = `https://www.youtube.com/watch?v=${video.raw.id}`;
        const title = he.decode(video.raw.snippet.title);
        const duration = `${video.duration.minutes ? padNumber(video.duration.minutes) : '00'}:${video.duration.seconds ? padNumber(video.duration.seconds) : '00'}`;
        const song = {
          url,
          title,
          duration,
          video,
          voiceChannel,
          requestedBy: message.member,
        };

        if ((config.music.queueLimit !== 0 && queue.length < config.music.queueLimit) || config.music.queueLimit === 0) queue.push(song);
        else return message.channel.send(this.config.queueLimited.replace('%s', config.music.queueLimit));
      }

      message.channel.send(this.config.playlistAdded.replace('%s', playlist.title));
      if (blocked === 1) message.channel.send(this.config['1ElementCouldntBeAdd'].replace('%s', blocked));
      else if (blocked >= 1) message.channel.send(this.config.SeveralElementCouldntBeAdd.replace('%s', blocked));

      if (!MusicBot.nowPlaying) return MusicBot.playSong(queue, message);
    } else if (query.match(regexps.video)) { // URL de Musique YouTube
      try {
        query = query.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        const id = query[2].split(/[^0-9a-z_-]/i)[0];
        if (MusicBot.blacklistedMusics.includes(id)) return message.channel.send(this.config.blacklistedMusic);

        const video = await youtube.getVideoByID(id);
        if (MusicBot.blacklistedChannels.includes(video.channel.id)) return message.channel.send(this.config.blacklistedChannel);

        this.prepareForPlaying(video, message, voiceChannel);
      } catch (err) {
        console.error(err);
        return message.channel.send(this.config.error);
      }
    } else { // Nom de Musique
      try {
        if (query.includes('--first')) {
          query = query.replace('--first', '');
          const videos = await youtube.searchVideos(query, 1);
          if (MusicBot.blacklistedMusics.includes(videos[0].id)) return message.channel.send(this.config.blacklistedMusic);
          if (MusicBot.blacklistedChannels.includes(videos[0].channel.id)) return message.channel.send(this.config.blacklistedChannel);

          const video = await youtube.getVideoByID(videos[0].id);
          return this.prepareForPlaying(video, message, voiceChannel);
        }

        // TODO Add search-limit to config.music
        const videos = await youtube.searchVideos(query, 5);
        if (videos.length === 0) return message.channel.send(this.config.noMusicFound.replace('%s', query));

        const videosNames = [];

        for (let i = 0; i < videos.length; i++) videosNames.push(`${i + 1}: ${he.decode(videos[i].title)}`);

        const embed = new MessageEmbed()
          .setTitle(this.config.chooseSong)
          .setFooter(`Éxécuté par ${message.author.username}`)
          .setTimestamp();

        for (let i = 0; i < videosNames.length; i++) embed.addField(`Musique ${i + 1}`, videosNames[i], true);

        const songEmbed = await message.channel.send(embed);
        for (let i = 0; i < videosNames.length; i++) await songEmbed.react(reactionsNumbers[i]);
        await songEmbed.react('❌');
        embed.setColor(config.colors.default);
        songEmbed.edit(embed);


        const collectorNumbers = songEmbed
          .createReactionCollector((reaction, user) => !user.bot
            && user.id === message.author.id
            && reactionsNumbers.includes(reaction.emoji.name))
          .once('collect', async (reaction) => {
            songEmbed.delete();
            collectorNumbers.stop();

            const videoIndex = parseInt(reactionsNumbers.indexOf(reaction.emoji.name), 10);
            if (MusicBot.blacklistedMusics.includes(videos[videoIndex].id)) return message.channel.send(this.config.blacklistedMusic);
            if (MusicBot.blacklistedChannels.includes(videos[videoIndex].channel.id)) return message.channel.send(this.config.blacklistedChannel);

            const video = await youtube.getVideoByID(videos[videoIndex].id);
            return this.prepareForPlaying(video, message, voiceChannel);
          });

        const collectorStop = songEmbed
          .createReactionCollector((reaction, user) => !user.bot
            && user.id === message.author.id
            && reaction.emoji.name === '❌')
          .once('collect', () => {
            message.delete();
            songEmbed.delete();
            collectorNumbers.stop();
            collectorStop.stop();
          });
      } catch (err) {
        console.error(err);
        return message.channel.send(this.config.error);
      }
    }
  }

  queuePush(song, message) {
    if (message.member.roles.has(config.roles.owner) && config.music.queueLimit !== 0 && queue.length > config.music.queueLimit) {
      message.channel.send(this.config.queueLimited);
      return false; // Echec
    }
    MusicBot.queue.push(song);
    return true; // Succès
  }

  async prepareForPlaying(video, message, voiceChannel) {
    if (video.raw.snippet.liveBroadcastContent === 'live') return message.channel.send(this.config.noLiveStream);
    if (video.duration.hours !== 0) return message.channel.send(this.config.songTooLong);

    const url = `https://www.youtube.com/watch?v=${video.raw.id}`;
    const title = he.decode(video.title);
    const duration = `${video.duration.minutes ? padNumber(video.duration.minutes) : '00'}:${video.duration.seconds ? padNumber(video.duration.seconds) : '00'}`;
    const song = {
      url,
      title,
      duration,
      video,
      voiceChannel,
      requestedBy: message.member,
    };

    if ((config.music.queueLimit !== 0 && queue.length > config.music.queueLimit)) {
      return message.channel.send(this.config.queueLimited);
    }
    queue.push(song);

    if (MusicBot.nowPlaying) return message.channel.send(this.config.songAdded.replace('%s', song.title).replace('%p', MusicBot.queue.length));
    return MusicBot.playSong(queue, message);
  }
}

export default Play;
