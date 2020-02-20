/* eslint-disable import/no-cycle */
import { loadBot,
  loadCommands,
  loadSkriptHubAPI,
  loadSkripttoolsAddons,
  loadSkripttoolsSkript,
  loadDatabases } from './setup';
import { success } from './helpers/messages';
import messageHandler from './events/messageEvent';
import reactionAddHandler from './events/messageReactionAddEvent';

export const config = require('../config/config.json'); // eslint-disable-line global-require

export const commands = [];
export const sanctions = [];

loadCommands();
export const db = loadDatabases();
export const client = loadBot();
export const SkriptHubSyntaxes = loadSkriptHubAPI();
export const SkripttoolsAddons = loadSkripttoolsAddons();
export const SkripttoolsSkript = loadSkripttoolsSkript();

client.on('ready', async () => {
  // Initializing the commands-stats database
  for (const command of commands) {
    await new Promise((resolve, reject) => {
      db.commandsStats.find({ command: command.name }, (err, docs) => {
        if (err) reject(void console.error(err)); // eslint-disable-line
        if (docs.length > 0) return resolve();

        db.commandsStats.insert({ command: command.name, used: 0 }, (err2, newDoc) => {
          if (err2) reject(void console.error(err2)); // eslint-disable-line
          resolve(newDoc);
        });
      });
    });
  }

  client.user.setActivity(config.bot.activity_on, { type: 'WATCHING' });

  success('Skript-MC bot loaded!');

  client.config = {};
  client.config.activated = true;

  setInterval(() => {
    // Tri dans les cooldowns des commandes
    for (const cmd of commands) {
      for (const [id, lastuse] of cmd.userCooldowns) {
        if (lastuse + cmd.cooldown >= Date.now()) cmd.userCooldowns.delete(id);
      }
    }
  }, config.bot.checkInterval);
});

client.on('message', messageHandler);
client.on('messageReactionAdd', reactionAddHandler);
client.on('error', console.error);
client.on('warn', console.warn);
