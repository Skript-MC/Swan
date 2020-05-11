/* eslint-disable import/no-cycle */
import moment from 'moment';
import { loadBot,
  loadCommands,
  loadSkriptHubAPI,
  loadSkripttoolsAddons,
  loadDatabases,
  loadConfig,
  loadEvents } from './setup';
import { randomActivity } from './utils';
import SanctionManager from './structures/SanctionManager';
import loadRssFeed from './structures/RSSFeed';
import loadSkriptReleases from './structures/skriptReleases';
import Command from './structures/Command';
import Logger from './structures/Logger';

moment.locale('fr');
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 55);
moment.relativeTimeThreshold('s', 55);
moment.relativeTimeThreshold('ss', 3);

export const logger = new Logger();
export const config = loadConfig();

export const commands = [];
export const sanctions = [];

loadCommands();

export const db = loadDatabases();
export const client = loadBot();

loadEvents(client);

const shouldLoadSyntaxes = config.messages.commands.syntaxinfo.enabled ?? true;
const shouldLoadAddons = config.messages.commands.addoninfo.enabled ?? true;
export const SkriptHubSyntaxes = shouldLoadSyntaxes ? loadSkriptHubAPI() : null;
export const SkripttoolsAddons = shouldLoadAddons ? loadSkripttoolsAddons() : null;

client.on('ready', async () => {
  logger.debug('main.js -> Client is ready (client.on(\'ready\'))');
  client.guild = client.guilds.resolve(config.bot.guild);

  // Verifying tokens and ids
  if (!process.env.DISCORD_API) throw new Error('Discord token was not set in the environment variables (DISCORD_API)');
  if (!process.env.YOUTUBE_API) throw new Error('Youtube token was not set in the environment variables (YOUTUBE_API)');
  if (!process.env.BOT) throw new Error('Bot id was not set in the environment variables (BOT)');
  if (!process.env.GUILD) throw new Error('Guild id was not set in the environment variables (GUILD)');
  for (const [key, value] of Object.entries(config.channels)) {
    if (!value) logger.warn(`config.channels.${key} is not set. You may want to fill this field to avoid any error.`);
    else if (!client.guild.channels.cache.has(value)) logger.warn(`The id entered for config.channels.${key} is not a valid channel.`);
  }
  for (const [key, value] of Object.entries(config.roles)) {
    if (!value) logger.warn(`config.roles.${key} is not set. You may want to fill this field to avoid any error.`);
    else if (!client.guild.roles.cache.has(value)) logger.warn(`The id entered for config.roles.${key} is not a valid role.`);
  }
  const clientMember = client.guild.members.resolve(client.user.id);
  const permissions = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'ATTACH_FILES', 'CONNECT', 'SPEAK', 'MANAGE_NICKNAMES', 'MANAGE_ROLES'];
  if (!clientMember.hasPermission(permissions)) logger.error(`Swan is missing permissions. Its cumulated roles' permissions does not contain one of the following: ${permissions.join(', ')}.`);

  logger.debug('main.js -> Checks of tokens, ids and permissions finished successfully');

  // Initializing the commands-stats database
  for (const command of commands) {
    const docs = await db.commandsStats.find({ command: command.name })
      .catch(console.error);
    if (docs.length > 0) continue;

    await db.commandsStats.insert({ command: command.name, used: 0 })
      .catch(console.error);
  }
  logger.debug('main.js -> commandsStats database initialized successfully');

  // Cache all messages that need to be cached
  const suggestionChannel = client.channels.cache.get(config.channels.suggestion);
  const suggestionMessages = await suggestionChannel.messages.fetch({ limit: 100 }, true);
  logger.step(`Messages cached! (${suggestionMessages.size})`);

  client.config = {};
  client.config.activated = true;

  logger.step('Skript-MC bot loaded!', true);

  setInterval(() => {
    Command.filterCooldown(commands); // Tri dans les cooldowns des commandes
    SanctionManager.checkSanctions(); // Vérification des sanctions temporaires
  }, config.bot.checkInterval.short);

  setInterval(() => {
    loadRssFeed(); // Chargement des flux RSS
    loadSkriptReleases(); // Vérification si une nouvelle version de Skript est sortie
    client.user.setPresence(randomActivity(client, commands, config.bot.prefix)); // On remet l'activité du bot (sinon elle s'enlève toute seule au bout d'un moment)
  }, config.bot.checkInterval.long);
});

client.on('error', (err) => { throw new Error(err); });
client.on('warn', logger.warn);

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', (err) => { throw new Error(err); });
  process.on('unhandledRejection', (err) => { throw new Error(err); });
}
