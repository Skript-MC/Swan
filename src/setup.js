/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-cycle */
import fs from 'fs';
import axios from 'axios';
import Discord from 'discord.js';
import { success } from './components/Messages';
import { config, commands } from './main';

require('dotenv').config();

const apikeys = {
  discord: process.env.DISCORD_API,
};

const GET = { method: 'GET' };

export function loadBot() {
  const client = new Discord.Client();
  client.login(apikeys.discord);
  return client;
}

export async function loadCommands(path = 'commands') {
  console.log(`loading : ${path}`);
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
          const Module = require(`${__dirname}/${path}/${file}`).default;
          const command = new Module();
          command.init();
          command.category = path.replace('commands/', '');
          commands.push(command);
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

  const allAddons = await axios(config.apis.addons, GET)
    .then(response => response.data.data)
    .catch(err => console.error(err.message));

  for (let addon of Object.keys(allAddons)) {
    const versions = allAddons[addon];
    const latest = versions[versions.length - 1];
    addon = await axios(`${config.apis.addons}${latest}`, GET)
      .then(response => response.data.data)
      .catch(err => console.error(err.message));
    addons.push(addon);
  }
  success('Skripttools\'s addons loaded!');
  return addons;
}

export async function loadSkripttoolsSkript() {
  const data = await axios(config.apis.skript, GET)
    .then(response => response.data)
    .catch(err => console.error(err));

  const latest = data.data[data.data.length - 1].replace(/\s/gimu, '+');

  const infos = await axios(`${config.apis.skript}${latest}`, GET)
    .then(response => response.data)
    .catch(err => console.error(err));

  success('Skripttools\'s skript infos loaded!');
  return infos;
}
