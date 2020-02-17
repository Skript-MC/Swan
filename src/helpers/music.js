/* eslint-disable import/no-cycle */
/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
import ytdl from 'ytdl-core';
import { config, db } from '../main';
import { success, discordError } from './messages';

class MusicBotApp {
  constructor() {
    this.enums = { NONE: 0, MUSIC: 1 };

    this.presets = new Map();
    this.presets.set('stop', { playNext: false, leave: false, sendFinishMsg: false });
    this.presets.set('skip', { playNext: true, leave: false, sendFinishMsg: false });
    this.presets.set('leave', { playNext: false, leave: true, sendFinishMsg: false });
    this.presets.set('default', { playNext: true, leave: true, sendFinishMsg: true });

    this.nowPlaying = undefined;
    this.dispatcher = undefined;
    this.queue = undefined;
    this.loop = this.enums.NONE;

    this.blacklistedMusics = [];
    this.blacklistedChannels = [];
    this.restricted = []; // Users
    this.fetch();
  }

  playSong(queue, message) {
    if (queue.length === 0) return;

    const voiceChannel = queue[0].voiceChannel;
    queue[0].voiceChannel.join()
      .then(async (co) => {
        this.dispatcher = co.play(await ytdl(queue[0].url, { filter: () => ['251'], highWaterMark: 33554432 }), { highWaterMark: 12 });

        this.dispatcher.on('start', () => {
          this.queue = queue;
          this.nowPlaying = queue[0];
          this.updateStats(this.nowPlaying);
          queue.shift();
          message.channel.send(config.messages.commands.play.nowPlaying.replace('%t', this.nowPlaying.title).replace('%d', this.nowPlaying.duration));
        });

        this.dispatcher.on('end', () => {
          const preset = this.presets.get(this.endReason || 'default');
          this.endReason = undefined;

          if (this.loop === this.enums.MUSIC && preset.playNext) {
            if (this.blacklistedMusics.includes(this.nowPlaying.video.id)) {
              message.channel.send(config.messages.commands.play.blacklistedMusic);
            } else {
              queue.unshift(this.nowPlaying);
            }
            this.playSong(queue, message);
          } else if (preset.playNext && queue.length >= 1) {
            this.playSong(queue, message);
          } else {
            this.nowPlaying = undefined;
            if (preset.sendFinishMsg) message.channel.send(config.messages.commands.play.queueFinished);
            if (preset.leave) voiceChannel.leave();
          }
        });

        this.dispatcher.on('error', (err) => {
          message.channel.send(config.messages.errors.cantplaymusic);
          voiceChannel.leave();
          console.error(err);
        });
      })
      .catch((err) => {
        message.channel.send(config.messages.errors.erroroccured);
        voiceChannel.leave();
        console.error(err);
      });
  }

  shuffleQueue(queue) {
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]]; // eslint-disable-line no-param-reassign
    }
  }

  join(message) {
    if (!message.member.voice.channel) {
      message.channel.send(discordError(config.messages.errors.joinErrors.notInChannel, message));
    } else if (config.music.restrictedVocal.includes(message.member.voice.channel.id)) {
      message.channel.send(discordError(config.messages.errors.joinErrors.restrictedChannel, message));
    } else if (message.member.voice.channel.full) {
      message.channel.send(discordError(config.messages.errors.joinErrors.channelFull, message));
    } else if (!message.member.voice.channel.speakable) {
      message.channel.send(discordError(config.messages.errors.joinErrors.notSpeakable, message));
    } else if (!message.member.voice.channel.joinable) {
      message.channel.send(discordError(config.messages.errors.joinErrors.notJoinable, message));
    } else {
      message.channel.send(config.messages.commands.join.comming);
      message.member.voice.channel.join();
    }
  }

  canUseCommand(message, options = { songPlaying: false, queueNotEmpty: false, notRestricted: false }) {
    if (!config.music.canUseMusicCommandsIfNotInChannel) { // Si l'option "pouvoir utiliser les commandes de musiques si on est pas dans le channel" est désactivé
      if (!message.member.voice.channel) return 0; // Si on est pas dans un channel
      if (!message.guild.voice || !message.guild.voice.connection || !message.guild.voice.channel) return 1; // Si le bot n'est pas dans un channel
      if (message.member.voice.channel !== message.guild.voice.channel) return 2; // Si on est pas dans le channel du bot
      if (options.songPlaying && !this.nowPlaying) return 3; // Si il faut qu'une musique soit en train d'être jouée
      if (options.queueNotEmpty && this.queue.length < 1) return 4; // Si il faut que la queue ne soit pas vide
      if (options.notRestricted && this.restricted.includes(message.author.id)) return 5; // Si il faut que l'utilisateur n'ai pas de restriction de commandes
    }
    return true;
  }

  fetch() {
    db.musics.find({ blacklist: true }, (err, results) => {
      if (err) console.error(err);
      this.blacklistedMusics = results.filter(result => result.type === 'music').map(result => result.ytid);
      this.blacklistedChannels = results.filter(result => result.type === 'channel').map(result => result.ytid);
    });
    db.sanctions.find({ sanction: 'music_restriction' }, (err, results) => {
      if (err) console.error(err);
      this.restricted = results.map(result => result.member);
    });
  }

  async updateStats(track) {
    const foundTrack = await new Promise((resolve, reject) => {
      db.musicsStats.findOne({ ytid: track.video.id }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (foundTrack !== null) db.musicsStats.update({ _id: foundTrack._id }, { $set: { played: foundTrack.played + 1 } });
    else db.musicsStats.insert({ ytid: track.video.id, played: 1, likes: [], dislikes: [] });
  }
}

const MusicBot = new MusicBotApp();
success('MusicBot loaded!');
export default MusicBot;
