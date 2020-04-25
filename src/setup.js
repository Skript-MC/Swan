/* eslint-disable import/no-dynamic-require, import/no-cycle */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Datastore from 'nedb-promises';
import { Client, Structures, MessageEmbed } from 'discord.js';
import { config, commands, logger } from './main';

require('dotenv').config();

const apikeys = {
  discord: process.env.DISCORD_API,
  skripthub: process.env.SKRIPTHUB_API,
};

export function loadConfig() {
  logger.debug('setup.js -> Loading configuration (loadConfig())');

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
  };
  conf.roles = {
    owner: ids.OWNER,
    forumMod: ids.FORUM_MOD,
    staff: ids.STAFF,
    ma: ids.MA,
    everyone: ids.EVERYONE,
  };
  conf.moderation.logCategory = ids.LOG_CATEGORY;
  conf.music.minRoleToClearQueue = ids.MIN_ROLE_TO_CLEAR_QUEUE;
  conf.music.restrictedVocal = ids.RESTRICTED_VOCAL ? ids.RESTRICTED_VOCAL.split(',') : [];

  logger.debug('setup.js -> Configuration finished loading');
  return conf;
}

function extendClasses() {
  Structures.extend('TextChannel', (TextChannel) => {
    class CustomTextChannel extends TextChannel {
      sendError(content, member, options) {
        const embed = new MessageEmbed()
          .setAuthor(member.displayName, member.user.avatarURL())
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
          .setAuthor(member.displayName, member.user.avatarURL())
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
          .setAuthor(member.displayName, member.user.avatarURL())
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

export function loadBot() {
  logger.debug('setup.js -> Loading bot (loadBot())');

  extendClasses();

  const client = new Client();
  client.login(apikeys.discord);

  logger.debug(`setup.js -> Bot finished loading (type: ${client.constructor.name})`);
  return client;
}

export function loadCommands(cmdPath = 'commands') {
  if (cmdPath !== 'commands') logger.step(`loading : ${cmdPath}`);

  fs.readdir(`${__dirname}/${cmdPath}`, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      const stat = fs.statSync(`${__dirname}/${cmdPath}/${file}`);
      if (stat.isDirectory()) {
        loadCommands(`${cmdPath}/${file}`);
      } else if (path.parse(file).ext === '.js') {
        try {
          const Module = require(`${__dirname}/${cmdPath}/${file}`).default; // eslint-disable-line global-require
          const command = new Module();
          if (command.enabled) {
            command.init();
            command.category = cmdPath.replace('commands/', '');
            commands.push(command);
          }
        } catch (e) {
          logger.error(`Unable to load this command: ${file}`);
          throw new Error(e);
        }
      }
    }
  });
}

export function loadEvents(client) {
  logger.step('loading events');

  fs.readdir(`${__dirname}/events/`, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (path.parse(file).ext === '.js') {
        try {
          const eventFunction = require(`${__dirname}/events/${file}`).default; // eslint-disable-line global-require
          const event = file.split('.')[0];
          client.on(event, (...args) => eventFunction(...args));
        } catch (e) {
          logger.error(`Unable to load this event: ${file}`);
          throw new Error(e);
        }
      }
    }
  });
}

export async function loadSkriptHubAPI() {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Token ${apikeys.skripthub}`,
    },
  };
  const syntaxes = [];

  await axios(`${config.apis.syntax}/syntax/`, options)
    .then((response) => {
      for (const syntax of response.data) syntaxes[syntax.id] = syntax;
    }).catch(console.error);

  await axios(`${config.apis.syntax}/syntaxexample/`, options)
    .then((response) => {
      for (const example of response.data) {
        if (syntaxes[example.syntax_element]) {
          syntaxes[example.syntax_element].example = example;
        }
      }
    }).catch(console.error);

  logger.step('SkriptHub : api loaded!');
  return syntaxes;
}

export async function loadSkripttoolsAddons() {
  let addons = [];

  const allAddons = await axios(config.apis.addons)
    .then(response => (response ? response.data.data : undefined))
    .catch(console.error);
  if (typeof allAddons === 'undefined') return logger.error(`Unable to retrieve informations from ${config.apis.addons}`);

  for (const addon of Object.keys(allAddons)) {
    const versions = allAddons[addon];
    // Cas rare (que 1 addon, mais ca lance une erreur et empêche de charger les autres addons, alors il vaut mieux l'éviter)
    if (!versions) continue;

    const latest = versions[versions.length - 1];
    addons.push(axios(`${config.apis.addons}${latest}`)
      .then(response => response.data.data)
      .catch(console.error));
  }
  addons = await Promise.all(addons);
  logger.step('Skripttools : addons loaded!');
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
    // Miscellaneous
    'miscellaneous',
    // Jokes
    'jokes',
  ];
  for (const db of databasesNames) {
    databases[db] = Datastore.create(`./databases/${db}.db`);
    databases[db].load()
      .then(() => logger.step(`Databases : "${db}.db" loaded!`))
      .catch(console.error);
  }

  return databases;
}
