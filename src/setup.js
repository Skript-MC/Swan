/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-cycle */
import fs from 'fs';
import axios from 'axios';
import Datastore from 'nedb-promises';
import { Client } from 'discord.js';
import { success } from './helpers/messages';
import { config, commands } from './main';

require('dotenv').config();

const apikeys = {
  discord: process.env.DISCORD_API,
  skripthub: process.env.SKRIPTHUB_API,
};
const GETtoken = {
  method: 'GET',
  headers: {
    Authorization: `Token ${apikeys.skripthub}`,
  },
};

export function loadConfig() {
  const conf = require('../config/config.json'); // eslint-disable-line global-require
  const ids = process.env;

  conf.bot.id = ids.bot;
  conf.bot.guild = ids.guild;
  conf.bot.defaultChannels = ids.defaultChannels ? ids.defaultChannels.split(',') : [];
  conf.bot.forbiddenChannels = ids.forbiddenChannels ? ids.forbiddenChannels.split(',') : [];
  conf.channels = {
    helpSkript: ids.helpSkript ? ids.helpSkript.split(',') : [],
    helpOther: ids.helpOther ? ids.helpOther.split(',') : [],
    snippet: ids.snippet,
    idea: ids.idea,
    suggestion: ids.suggestion,
    reunion: ids.reunion,
    main: ids.main,
    logs: ids.logs,
    bot: ids.bot,
  };
  conf.roles = {
    owner: ids.owner,
    forumMod: ids.forumMod,
    staff: ids.staff,
    ma: ids.ma,
    everyone: ids.everyone,
    nitrobooster: ids.nitrobooster,
  };
  conf.moderation.logCategory = ids.logCategory;
  conf.music.minRoleToClearQueue = ids.minRoleToClearQueue;
  conf.music.restrictedVocal = ids.restrictedVocal ? ids.restrictedVocal.split(',') : [];

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
          console.error(e);
        }
      }
    }
  });
}

export async function loadSkriptHubAPI() {
  const syntaxes = [];
  await axios(`${config.apis.syntax}/syntax/`, GETtoken)
    .then((response) => {
      for (const syntax of response.data) syntaxes[syntax.id] = syntax;
    }).catch(console.error);

  await axios(`${config.apis.syntax}/syntaxexample/`, GETtoken)
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
  const addons = [];

  const allAddons = await axios(config.apis.addons)
    .then(response => (response ? response.data.data : undefined))
    .catch(console.error);
  if (typeof allAddons === 'undefined') return console.error(`Unable to retrieve informations from ${config.apis.addons}`);

  for (let addon of Object.keys(allAddons)) {
    const versions = allAddons[addon];
    const latest = versions[versions.length - 1];
    addon = await axios(`${config.apis.addons}${latest}`)
      .then(response => response.data.data)
      .catch(console.error);
    addons.push(addon);
  }
  success('Skripttools : addons loaded!');
  return addons;
}

export async function loadSkripttoolsSkript() {
  const data = await axios(config.apis.skript)
    .then(response => (response ? response.data : undefined))
    .catch(console.error);
  if (typeof data === 'undefined') return console.error(`Unable to retrieve informations from ${config.apis.skript}`);

  const latest = data.data[data.data.length - 1].replace(/\s/gimu, '+');

  const infos = await axios(`${config.apis.skript}${latest}`)
    .then(response => response.data)
    .catch(console.error);

  success('Skripttools : skript infos loaded!');
  return infos;
}

export function loadDatabases() {
  if (!fs.existsSync('../databases/ban-logs')) fs.mkdirSync('../databases/ban-logs');

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
    // Store credits
    'credits',
  ];
  for (const db of databasesNames) {
    databases[db] = Datastore.create(`./databases/${db}.db`);
    databases[db].load()
      .then(() => success(`Databases : "${db}.db" loaded!`))
      .catch(console.error);
  }

  return databases;
}
