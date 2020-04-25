/* eslint-disable import/no-cycle, object-curly-newline, prefer-destructuring */
import ytdl from 'discord-ytdl-core';
import { config, db } from '../main';

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
    this.bassboost = 0;

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
        const input = ytdl(queue[0].url, {
          filter: 'audioonly',
          quality: 'highestaudio',
          highWaterMark: 1 << 25, // eslint-disable-line no-bitwise
          passArgs: ['-af', `equalizer=f=40:width_type=h:width=50:g=${this.bassboost}`],
        });

        this.dispatcher = co.play(
          input,
          {
            highWaterMark: 1,
            type: 'converted',
            bitrate: 320000,
          },
        );

        this.dispatcher.on('start', () => {
          this.queue = queue;
          this.nowPlaying = queue[0];
          this.updateStats(this.nowPlaying);
          queue.shift();
          message.channel.send(config.messages.commands.play.nowPlaying.replace('%t', this.nowPlaying.title).replace('%d', this.nowPlaying.duration));
        });

        this.dispatcher.on('finish', () => {
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
          throw new Error(err);
        });
      })
      .catch((err) => {
        message.channel.send(config.messages.errors.erroroccured);
        voiceChannel.leave();
        throw new Error(err);
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
      message.channel.sendError(config.messages.errors.joinErrors.notInChannel, message.member);
    } else if (config.music.restrictedVocal.includes(message.member.voice.channel.id)) {
      message.channel.sendError(config.messages.errors.joinErrors.restrictedChannel, message.member);
    } else if (message.member.voice.channel.full) {
      message.channel.sendError(config.messages.errors.joinErrors.channelFull, message.member);
    } else if (!message.member.voice.channel.speakable) {
      message.channel.sendError(config.messages.errors.joinErrors.notSpeakable, message.member);
    } else if (!message.member.voice.channel.joinable) {
      message.channel.sendError(config.messages.errors.joinErrors.notJoinable, message.member);
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

  shouldAskOthers(member) {
    const membersInChannel = member.voice.channel.members;
    const restrictedMembers = [];
    for (const restrictedMemberId of this.restricted) {
      if (membersInChannel.has(restrictedMemberId)) restrictedMembers.push(restrictedMemberId);
    }

    if (!member.roles.cache.has(config.roles.staff)
      && membersInChannel.size > 2
      && membersInChannel.size - restrictedMembers.length > 2
      && config.music.shouldAskPermissionForSomeCommands) return true;
    return false;
  }

  async askPermission(cb, reason, message, args, cmdConfig) {
    if (this.shouldAskOthers(message.member)) {
      const messageContent = config.messages.miscellaneous.musicAskOthers
        .replace('%u', message.member.nickname || message.author.username)
        .replace('%s', reason);

      const membersInChannel = message.member.voice.channel.members;
      const restrictedMembers = [];
      for (const restrictedMemberId of this.restricted) {
        if (membersInChannel.has(restrictedMemberId)) restrictedMembers.push(restrictedMemberId);
      }

      const membersCount = membersInChannel.size - restrictedMembers.length - 1;
      const half = Math.ceil(membersCount / 2);
      const neededCount = (half % 2 === 0 || half === 1) ? half + 1 : half;
      const askMsg = await message.channel.send(messageContent.replace('%d', `0/${neededCount}`));
      let ended = false;

      await askMsg.react('✅');
      await askMsg.react('❌');

      const collector = askMsg
        .createReactionCollector((reaction, user) => {
          if (this.restricted.includes(user.id)) {
            askMsg.reactions.cache.find(r => r.emoji.name === reaction.emoji.name).users.remove(user);
            user.send(config.messages.errors.music[5]);
            return false;
          }
          return !user.bot
            && message.guild.voice.connection.channel.members.has(user.id)
            && ['✅', '❌'].includes(reaction.emoji.name);
        }).on('collect', (reaction) => {
          const inFavour = askMsg.reactions.cache.find(r => r.emoji.name === '✅').users.cache.size - 1;
          const against = askMsg.reactions.cache.find(r => r.emoji.name === '❌').users.cache.size - 1;
          if (reaction.emoji.name === '✅') {
            askMsg.edit(messageContent.replace('%d', `${inFavour}/${neededCount}`));
            if (inFavour === neededCount) {
              askMsg.edit(messageContent.replace('%d', `:white_check_mark: Accepté à la majorité (${inFavour}/${neededCount})`));
              askMsg.reactions.removeAll();
              collector.stop();
              ended = true;
              cb(message, args, cmdConfig);
            }
          } else if (reaction.emoji.name === '❌') {
            if (against >= neededCount) {
              askMsg.edit(messageContent.replace('%d', ':x: Refusé à la majorité'));
              askMsg.reactions.removeAll();
              collector.stop();
              ended = true;
            }
          }

          if (against + inFavour === membersCount && against >= inFavour) {
            askMsg.edit(messageContent.replace('%d', ':x: Tout le monde a voté, mais les "pour" ne l\'ont pas emporté.'));
            collector.stop();
            ended = true;
          }
        });

      setTimeout(() => {
        if (ended) return;
        askMsg.edit(messageContent.replace('%d', ':x: Le vote a expiré'));
        collector.stop();
      }, 60 * 1000);
      return;
    }

    cb(message, args, cmdConfig);
  }

  async fetch() {
    const results = await db.musics.find({ blacklist: true }).catch(console.error);
    this.blacklistedMusics = results.filter(elt => elt.type === 'music').map(elt => elt.ytid);
    this.blacklistedChannels = results.filter(elt => elt.type === 'channel').map(elt => elt.ytid);

    const results2 = await db.sanctions.find({ sanction: 'music_restriction' }).catch(console.error);
    this.restricted = results2.map(elt => elt.member);
  }

  async updateStats(track) {
    const foundTrack = await db.musicsStats.findOne({ ytid: track.video.id }).catch(console.error);

    if (foundTrack) {
      await db.musicsStats.update(
        { _id: foundTrack._id },
        { $set: { played: foundTrack.played + 1 } },
      ).catch(console.error);
    } else {
      await db.musicsStats.insert(
        { ytid: track.video.id, played: 1, likes: [], dislikes: [] },
      ).catch(console.error);
    }
  }
}

const MusicBot = new MusicBotApp();
export default MusicBot;
