/* eslint-disable import/no-cycle */
import { Client } from 'discord.js';
import moment from 'moment';
import { extendClasses,
  loadCommands,
  loadSkriptHubAPI,
  loadSkripttoolsAddons,
  loadDatabases,
  loadConfig,
  loadEvents } from './setup';
import Logger from './structures/Logger';

moment.locale('fr');
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 55);
moment.relativeTimeThreshold('s', 55);
moment.relativeTimeThreshold('ss', 3);

extendClasses();

export const client = new Client();
client.config = loadConfig();
client.logger = new Logger();
client.activated = true;
client.commands = [];
client.login(process.env.DISCORD_API);

loadCommands();
loadEvents();

export const db = loadDatabases();

const shouldLoadSyntaxes = client.config.messages.commands.syntaxinfo.enabled ?? true;
const shouldLoadAddons = client.config.messages.commands.addoninfo.enabled ?? true;
export const SkriptHubSyntaxes = shouldLoadSyntaxes ? loadSkriptHubAPI() : null;
export const SkripttoolsAddons = shouldLoadAddons ? loadSkripttoolsAddons() : null;

client.on('error', (err) => { throw new Error(err); });
client.on('warn', client.logger.warn);

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', (err) => { throw new Error(err); });
  process.on('unhandledRejection', (err) => { throw new Error(err); });
}
