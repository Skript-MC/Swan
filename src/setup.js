/* eslint-disable import/no-dynamic-require, import/no-cycle */
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import Datastore from 'nedb-promises';
import { Structures, MessageEmbed } from 'discord.js';
import { client } from './main';

require('dotenv').config();

export function loadConfig() {
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

export function extendClasses() {
  Structures.extend('TextChannel', (TextChannel) => {
    class CustomTextChannel extends TextChannel {
      sendError(content, member, options) {
        const embed = new MessageEmbed()
          .attachFiles(['./assets/error.png'])
          .setThumbnail('attachment://error.png')
          .setTitle('Erreur')
          .setColor(client.config.colors.error)
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
          .setColor(client.config.colors.default)
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
          .setColor(client.config.colors.success)
          .setDescription(content)
          .setTimestamp()
          .setFooter(`Exécuté par ${member.displayName}`);
        this.send(embed, options);
      }
    }

    return CustomTextChannel;
  });
}

export async function loadCommands(dir = 'commands') {
  if (dir !== 'commands') client.logger.step(`loading: ${dir}`);

  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) loadCommands(path.join(dir, file));
    if (file.endsWith('.js')) {
      const Command = require(path.join(filePath, file)).default; // eslint-disable-line global-require
      const cmd = new Command();
      if (cmd.enabled) {
        cmd.category = dir.replace('commands/', '');
        client.commands.push(cmd);
      }
    }
  }
}

export async function loadEvents() {
  client.logger.step('loading events');
  const filePath = path.join(__dirname, 'events');
  const files = await fs.readdir(filePath);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const eventFunction = require(path.join(filePath, file)).default; // eslint-disable-line global-require
      const event = file.split('.')[0];
      client.on(event, eventFunction);
    }
  }
}

export async function loadSkriptHubAPI() {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.SKRIPTHUB_API}`,
    },
  };
  const syntaxes = [];

  await axios(`${client.config.apis.syntax}/syntax/`, options)
    .then((response) => {
      for (const syntax of response.data) syntaxes[syntax.id] = syntax;
    }).catch(console.error);

  await axios(`${client.config.apis.syntax}/syntaxexample/`, options)
    .then((response) => {
      for (const example of response.data) {
        if (syntaxes[example.syntax_element]) {
          syntaxes[example.syntax_element].example = example;
        }
      }
    }).catch(console.error);

  client.logger.step('SkriptHub : api loaded!');
  return syntaxes;
}

export async function loadSkripttoolsAddons() {
  let addons = [];

  const allAddons = await axios(client.config.apis.addons)
    .then(response => (response ? response.data.data : undefined))
    .catch(console.error);
  if (typeof allAddons === 'undefined') return client.logger.error(`Unable to retrieve informations from ${client.config.apis.addons}`);

  for (const addon of Object.keys(allAddons)) {
    const versions = allAddons[addon];
    // Cas rare (que 1 addon, mais ca lance une erreur et empêche de charger les autres addons, alors il vaut mieux l'éviter)
    if (!versions) continue;

    const latest = versions[versions.length - 1];
    addons.push(axios(`${client.config.apis.addons}${latest}`)
      .then(response => response.data.data)
      .catch(console.error));
  }
  addons = await Promise.all(addons);
  client.logger.step('Skripttools : addons loaded!');
  return addons;
}

export function loadDatabases() {
  const databases = {};
  const databasesNames = [
    // Store all current sanctions
    'sanctions',
    // Store all sanctions history
    'sanctionsHistory',
    // Store all blacklisted musics and channels
    'musics',
    // Store all music stats
    'musicsStats',
    // Store all commands stats
    'commandsStats',
    // Jokes stats
    'jokes',
    // Polls objects
    'polls',
    // Miscellaneous
    'miscellaneous',
  ];
  for (const db of databasesNames) {
    databases[db] = Datastore.create(`./databases/${db}.db`);
    databases[db].load()
      .then(() => client.logger.step(`Databases : "${db}.db" loaded!`))
      .catch(console.error);
    databases[db].on('__error__', (datastore, event, error, ...args) => {
      client.logger.error(`Database ${db} generated the following error (${event}). Arguments: ${args}`);
      console.error(error);
    });
  }

  return databases;
}
