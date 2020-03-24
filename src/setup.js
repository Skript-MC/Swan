/* eslint-disable import/no-dynamic-require, import/no-cycle */
import fs from 'fs';
import axios from 'axios';
import Datastore from 'nedb-promises';
import { Client } from 'discord.js';
import { success } from './structures/messages';
import { config, commands } from './main';

require('dotenv').config();

const apikeys = {
  discord: process.env.DISCORD_API,
  skripthub: process.env.SKRIPTHUB_API,
};

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

  return conf;
}

export function loadBot() {
  const client = new Client();
  client.login(apikeys.discord);
  return client;
}

export function loadCommands(path = 'commands') {
  if (path !== 'commands') console.log(`loading : ${path}`);

  fs.readdir(`${__dirname}/${path}`, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      const stat = fs.statSync(`${__dirname}/${path}/${file}`);
      if (stat.isDirectory()) {
        loadCommands(`${path}/${file}`);
      } else if (file === '.DS_Store') {
        continue;
      } else {
        try {
          const Module = require(`${__dirname}/${path}/${file}`).default; // eslint-disable-line global-require
          const command = new Module();
          if (command.enabled) {
            command.init();
            command.category = path.replace('commands/', '');
            commands.push(command);
          }
        } catch (e) {
          console.error(`Unable to load this command: ${file}`);
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

  success('SkriptHub : api loaded!');
  return syntaxes;
}

export async function loadSkripttoolsAddons() {
  let addons = [];

  const allAddons = await axios(config.apis.addons)
    .then(response => (response ? response.data.data : undefined))
    .catch(console.error);
  if (typeof allAddons === 'undefined') return console.error(`Unable to retrieve informations from ${config.apis.addons}`);

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
  success('Skripttools : addons loaded!');
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
      .then(() => success(`Databases : "${db}.db" loaded!`))
      .catch(console.error);
  }

  return databases;
}
