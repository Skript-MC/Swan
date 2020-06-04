/* eslint-disable import/no-cycle */
import moment from 'moment';
import { loadSkriptHubAPI,
  loadSkripttoolsAddons,
  loadDatabases } from './setup';
import SwanClient from './SwanClient';

require('dotenv').config();

moment.locale('fr');
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 55);
moment.relativeTimeThreshold('s', 55);
moment.relativeTimeThreshold('ss', 3);

export const client = new SwanClient();
export const db = loadDatabases(client);

const shouldLoadSyntaxes = client.config.messages.commands.syntaxinfo.enabled ?? true;
const shouldLoadAddons = client.config.messages.commands.addoninfo.enabled ?? true;
export const SkriptHubSyntaxes = shouldLoadSyntaxes ? loadSkriptHubAPI(client) : null;
export const SkripttoolsAddons = shouldLoadAddons ? loadSkripttoolsAddons(client) : null;

client.on('error', (err) => { throw new Error(err); });
client.on('warn', client.logger.warn);

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', (err) => { throw new Error(err); });
  process.on('unhandledRejection', (err) => { throw new Error(err); });
}
