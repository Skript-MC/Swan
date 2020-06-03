/* eslint-disable import/no-cycle, max-classes-per-file */
import { promises as fs } from 'fs';
import path from 'path';
import { Client, Structures, MessageEmbed } from 'discord.js';
import Logger from './structures/Logger';
import { db } from './main';
import ModerationData from './structures/ModerationData';
import ACTION_TYPE from './structures/actions/actionType';
import BanAction from './structures/actions/BanAction';
import UnbanAction from './structures/actions/UnbanAction';
import UnmuteAction from './structures/actions/UnmuteAction';
import RemoveWarnAction from './structures/actions/RemoveWarnAction';
import { endPoll } from './commands/fun/poll';

class SwanClient extends Client {
  constructor(options) {
    super(options);

    this.config = this.loadConfig();
    this.logger = new Logger();
    this.activated = true;
    this.commands = [];
    this.login(process.env.DISCORD_API);

    this.extendClasses();

    this.loadCommands();
    this.loadEvents();
  }

  loadConfig() {
    const conf = require('../config/config.json'); // eslint-disable-line global-require
    const ids = process.env;

    conf.bot.id = ids.BOT;
    conf.bot.guild = ids.GUILD;
    conf.bot.defaultChannels = ids.DEFAULT_CHANNELS ? ids.DEFAULT_CHANNELS.split(',') : [];
    conf.bot.forbiddenChannels = ids.FORBIDDEN_CHANNELS ? ids.FORBIDDEN_CHANNELS.split(',') : [];
    conf.channels = {
      helpSkript: ids.HELP_SKRIPT ? ids.HELP_SKRIPT.split(',') : [],
      helpOther: ids.HELP_OTHER ? ids.HELP_OTHER.split(',') : [],
      snippet: ids.SNIPPET,
      idea: ids.IDEA,
      suggestion: ids.SUGGESTION,
      main: ids.MAIN,
      logs: ids.LOGS,
      rssFeed: ids.RSS_FEED,
      skriptNews: ids.SKRIPT_NEWS,
      bot: ids.BOT_CHANNEL,
    };
    conf.roles = {
      owner: ids.OWNER,
      forumMod: ids.FORUM_MOD,
      staff: ids.STAFF,
      ma: ids.MA,
      everyone: ids.EVERYONE,
      ban: ids.BAN,
      mute: ids.MUTE,
      eventNotifications: ids.EVENT_NOTIFICATIONS,
      minRoleToClearQueue: ids.MIN_ROLE_TO_CLEAR_QUEUE,
    };
    conf.moderation.logCategory = ids.LOG_CATEGORY;
    conf.music.minRoleToClearQueue = ids.MIN_ROLE_TO_CLEAR_QUEUE;
    conf.music.restrictedVocal = ids.RESTRICTED_VOCAL ? ids.RESTRICTED_VOCAL.split(',') : [];
    conf.sendCommandStats = ids.COMMAND_STATS_USERS ? ids.COMMAND_STATS_USERS.split(',') : [];

    return conf;
  }

  extendClasses() {
    const { config } = this;
    Structures.extend('TextChannel', (TextChannel) => {
      class CustomTextChannel extends TextChannel {
        sendError(content, member, options) {
          const embed = new MessageEmbed()
            .attachFiles(['./assets/error.png'])
            .setThumbnail('attachment://error.png')
            .setTitle('Erreur')
            .setColor(config.colors.error)
            .setDescription(content)
            .setTimestamp()
            .setFooter(`Exécuté par ${member.displayName}`);
          this.send(embed, options);
        }

        sendInfo(content, member, options) {
          const embed = new MessageEmbed()
            .attachFiles(['./assets/information.png'])
            .setThumbnail('attachment://information.png')
            .setTitle('Information')
            .setColor(config.colors.default)
            .setDescription(content)
            .setTimestamp()
            .setFooter(`Exécuté par ${member.displayName}`);
          this.send(embed, options);
        }

        sendSuccess(content, member, options) {
          const embed = new MessageEmbed()
            .attachFiles(['./assets/success.png'])
            .setThumbnail('attachment://success.png')
            .setTitle('Succès')
            .setColor(config.colors.success)
            .setDescription(content)
            .setTimestamp()
            .setFooter(`Exécuté par ${member.displayName}`);
          this.send(embed, options);
        }
      }

      return CustomTextChannel;
    });
  }

  async loadCommands(dir = 'commands') {
    if (dir !== 'commands') this.logger.step(`loading: ${dir}`);

    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
      const stat = await fs.lstat(path.join(filePath, file));
      if (stat.isDirectory()) this.loadCommands(path.join(dir, file));
      if (file.endsWith('.js')) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const Command = require(path.join(filePath, file)).default;
        const cmd = new Command();
        if (cmd.enabled) {
          cmd.category = dir.replace('commands/', '');
          this.commands.push(cmd);
        }
      }
    }
  }

  async loadEvents() {
    this.logger.step('loading events');
    const filePath = path.join(__dirname, 'events');
    const files = await fs.readdir(filePath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const eventFunction = require(path.join(filePath, file)).default;
        const event = file.split('.')[0];
        this.on(event, eventFunction);
      }
    }
  }

  async checkSanctions() {
    // Trouver tous les élements dont la propriété "finish" est inférieure ($lt) à maintenant et ($and) la durée
    // ("duration") n'est pas égale ($not) à -1 (= ban def)
    const query = {
      $and: [
        { finish: { $lt: Date.now() } },
        { $not: { duration: -1 } }],
    };
    const results = await db.sanctions.find(query).catch(console.error);

    for (const result of results) {
      const victim = this.guild.members.cache.get(result.member) || await this.users.fetch(result.member);
      const data = new ModerationData()
        .setType(ACTION_TYPE.opposite(result.type))
        .setColor(this.config.colors.success)
        .setVictim(victim)
        .setReason(this.config.messages.miscellaneous.sanctionExpired)
        .setModerator(this.guild.members.resolve(this.user.id))
        .setMessageChannel(this.guild.channels.resolve(this.config.channels.logs));

      if (result.type === ACTION_TYPE.BAN && !result.hasSentMessages && result.hardbanIfNoMessages) {
        data.setType(ACTION_TYPE.HARDBAN)
          .setColor(this.config.colors.hardban)
          .setReason(this.config.messages.miscellaneous.inactivityWhileBanned)
          .setDuration(-1)
          .setFinishTimestamp();
        new BanAction(data).commit();
        continue;
      }

      if (data.type === ACTION_TYPE.UNBAN) new UnbanAction(data).commit();
      else if (data.type === ACTION_TYPE.UNMUTE) new UnmuteAction(data).commit();
      else if (data.type === ACTION_TYPE.REMOVE_WARN) {
        data.setWarnId(result.id);
        new RemoveWarnAction(data).commit();
      }
    }
  }

  async checkPolls() {
    const polls = await db.polls.find({ finish: { $lt: Date.now() } }).catch(console.error);
    for (const poll of polls) endPoll(this, poll);
  }
}

export default SwanClient;
