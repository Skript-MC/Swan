/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-cycle */
import fs from 'fs';
import axios from 'axios';
import Datastore from 'nedb';
import { Client } from 'discord.js';
import { success } from './components/Messages';
import { config, commands } from './main';

require('dotenv').config();

const apikeys = {
  discord: process.env.DISCORD_API,
};

function dbCallback(err, name) {
  if (err) console.error(`Unable to load db "${name}" :\n`, err);
  else success(`Databases : "${name}.db" loaded!`);
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
  const db = {};
  // Store all sanctions
  db.sanctions = new Datastore('./databases/sanctions.db');
  db.sanctions.loadDatabase(err => dbCallback(err, 'sanctions'));
  // Store all blacklisted musics
  db.musics = new Datastore('./databases/musics.db');
  db.musics.loadDatabase(err => dbCallback(err, 'musics'));
  // Store all music stats
  db.musicsStats = new Datastore('./databases/musicsStats.db');
  db.musicsStats.loadDatabase(err => dbCallback(err, 'musicsStats'));

  return db;
}
