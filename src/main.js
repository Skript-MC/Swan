/* eslint-disable import/no-cycle */
import { loadBot,
  loadCommands,
  loadSkriptHubAPI,
  loadSkripttoolsAddons,
  loadDatabases,
  loadConfig } from './setup';
import { success } from './structures/messages';
import messageHandler from './events/message';
import reactionAddHandler from './events/messageReactionAdd';
import messageDeleteHandler from './events/messageDelete';
import memberAddHandler from './events/memberAdd';
import messageUpdateHandler from './events/messageUpdate';
import SanctionManager from './structures/SanctionManager';
import loadRssFeed from './structures/RSSFeed';
import Command from './structures/Command';

export const config = loadConfig();

export const commands = [];
export const sanctions = [];

loadCommands();
export const db = loadDatabases();
export const client = loadBot();

const shouldLoadSyntaxes = config.messages.commands.syntaxinfo.enabled ?? true;
const shouldLoadAddons = config.messages.commands.addoninfo.enabled ?? true;
export const SkriptHubSyntaxes = shouldLoadSyntaxes ? loadSkriptHubAPI() : null;
export const SkripttoolsAddons = shouldLoadAddons ? loadSkripttoolsAddons() : null;

client.on('ready', async () => {
  // Verifying tokens and ids
  if (!process.env.DISCORD_API) throw new Error('Discord token was not set in the environment variables (DISCORD_API)');
  if (!process.env.YOUTUBE_API) throw new Error('Youtube token was not set in the environment variables (YOUTUBE_API)');
  if (!process.env.BOT) throw new Error('Bot id was not set in the environment variables (BOT)');
  if (!process.env.GUILD) throw new Error('Guild id was not set in the environment variables (GUILD)');
  for (const [key, value] of Object.entries(config.channels)) {
    if (!value) console.warn(`config.channels.${key} is not set. You may want to fill this field to avoid any error.`);
  }
  for (const [key, value] of Object.entries(config.roles)) {
    if (!value) console.warn(`config.roles.${key} is not set. You may want to fill this field to avoid any error.`);
  }

  // Initializing the commands-stats database
  for (const command of commands) {
    const docs = await db.commandsStats.find({ command: command.name })
      .catch(console.error);
    if (docs.length > 0) continue;

    await db.commandsStats.insert({ command: command.name, used: 0 })
      .catch(console.error);
  }

  // Cache all messages that need to be cached
  const suggestionChannel = client.channels.cache.get(config.channels.suggestion);
  const suggestionMessages = await suggestionChannel.messages.fetch({ limit: 100 }, true);
  success(`Messages cached! (${suggestionMessages.size})`);

  client.user.setActivity(config.bot.activity_on, { type: 'WATCHING' });
  client.config = {};
  client.config.activated = true;

  const guild = client.guilds.resolve(config.bot.guild);

  success('Skript-MC bot loaded!');

  setInterval(() => {
    // Tri dans les cooldowns des commandes
    Command.filterCooldown(commands);
    // Vérification des sanctions temporaires
    SanctionManager.checkSanctions(guild);
    // Chargement des flux RSS
    loadRssFeed();
  }, config.bot.checkInterval);
});

client.on('message', messageHandler);
client.on('messageDelete', messageDeleteHandler);
client.on('messageUpdate', messageUpdateHandler);
client.on('messageReactionAdd', reactionAddHandler);

client.on('guildMemberAdd', memberAddHandler);

client.on('error', console.error);
client.on('warn', console.warn);

process.on('uncaughtException', (err) => { throw new Error(err); });
process.on('unhandledRejection', (err) => { throw new Error(err); });
