import { client, db } from '../main';
import Command from '../structures/Command';
import loadRssFeed from '../structures/RSSFeed';
import loadSkriptReleases from '../structures/skriptReleases';
import { randomActivity } from '../utils';

export default async function readyHandler() {
  client.guild = client.guilds.resolve(client.config.bot.guild);

  // Verifying tokens and ids
  if (!process.env.DISCORD_API) throw new Error('Discord token was not set in the environment variables (DISCORD_API)');
  if (!process.env.YOUTUBE_API) throw new Error('Youtube token was not set in the environment variables (YOUTUBE_API)');
  if (!process.env.BOT) throw new Error('Bot id was not set in the environment variables (BOT)');
  if (!process.env.GUILD) throw new Error('Guild id was not set in the environment variables (GUILD)');
  const channels = client.guild.channels.cache;
  for (const [key, value] of Object.entries(client.config.channels)) {
    if (value instanceof Array) {
      if (value.length === 0) client.logger.warn(`config.channels.${key} is not set. You may want to fill this field to avoid any error.`);
      else if (!value.every(elt => channels.has(elt))) client.logger.warn(`One of the id entered for config.channels.${key} is not a valid channel.`);
    } else if (!value) client.logger.warn(`config.channels.${key} is not set. You may want to fill this field to avoid any error.`);
    else if (!channels.has(value)) client.logger.warn(`The id entered for config.channels.${key} is not a valid channel.`);
  }
  for (const [key, value] of Object.entries(client.config.roles)) {
    if (!value) client.logger.warn(`config.roles.${key} is not set. You may want to fill this field to avoid any error.`);
    else if (!client.guild.roles.cache.has(value)) client.logger.warn(`The id entered for config.roles.${key} is not a valid role.`);
  }
  const clientMember = client.guild.members.resolve(client.user.id);
  const permissions = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'ATTACH_FILES', 'CONNECT', 'SPEAK', 'MANAGE_NICKNAMES', 'MANAGE_ROLES'];
  if (!clientMember.hasPermission(permissions)) client.logger.error(`Swan is missing permissions. Its cumulated roles' permissions does not contain one of the following: ${permissions.join(', ')}.`);

  client.logger.debug('main.js -> Checks of tokens, ids and permissions finished successfully');

  // Initializing the commands-stats database
  for (const command of client.commands) {
    const docs = await db.commandsStats.find({ command: command.name }).catch(console.error);
    if (docs.length > 0) continue;

    await db.commandsStats.insert({ command: command.name, used: 0 }).catch(console.error);
  }
  client.logger.debug('main.js -> commandsStats database initialized successfully');

  // Cache all messages that need to be cached
  const suggestionChannel = client.channels.cache.get(client.config.channels.suggestion);
  const suggestionMessages = await suggestionChannel.messages.fetch({ limit: 100 }, true);
  client.logger.step(`Messages cached! (${suggestionMessages.size})`);
  client.logger.step('Skript-MC bot loaded!', true);

  setInterval(() => {
    Command.filterCooldown(client.commands); // Tri dans les cooldowns des commandes
    client.checkSanctions(); // Vérification des sanctions temporaires
    client.checkPolls(); // Vérification des sondages
  }, client.config.bot.checkInterval.short);

  setInterval(() => {
    loadRssFeed(); // Chargement des flux RSS
    loadSkriptReleases(); // Vérification si une nouvelle version de Skript est sortie
    // On remet l'activité du bot (sinon elle s'enlève toute seule au bout d'un moment) :
    client.user.setPresence(randomActivity(client, client.commands, client.config.bot.prefix));
  }, client.config.bot.checkInterval.long);
}
