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

export const config = loadConfig();

export const commands = [];
export const sanctions = [];

loadCommands();
export const db = loadDatabases();
export const client = loadBot();

const shouldLoadSyntaxes = config.messages.commands.syntaxinfo.enabled;
const shouldLoadAddons = config.messages.commands.addoninfo.enabled;
export const SkriptHubSyntaxes = shouldLoadSyntaxes ? loadSkriptHubAPI() : null;
export const SkripttoolsAddons = shouldLoadAddons ? loadSkripttoolsAddons() : null;

client.on('ready', async () => {
  // Verifying tokens and ids
  if (!process.env.DISCORD_API) throw new Error('Discord token was not set in the environment variables (DISCORD_API)');
  if (!process.env.YOUTUBE_API) throw new Error('Youtube token was not set in the environment variables (YOUTUBE_API)');
  if (!process.env.BOT) throw new Error('Bot id was not set in the environment variables (BOT)');
  if (!process.env.GUILD) throw new Error('Guild id was not set in the environment variables (GUILD)');
  for (const value of Object.values(config.channels)) {
    if (!value) console.warn(`config.channels.${value} is not set. You may want to fill this field to avoid any error.`);
  }
  for (const value of Object.values(config.roles)) {
    if (!value) console.warn(`config.roles.${value} is not set. You may want to fill this field to avoid any error.`);
  }

  // Initializing the commands-stats database
  for (const command of commands) {
    const docs = await db.commandsStats.find({ command: command.name })
      .catch(console.error);
    if (docs.length > 0) continue;

    await db.commandsStats.insert({ command: command.name, used: 0 })
      .catch(console.error);
  }

  // Cache all suggestions
  const suggestionChannel = client.channels.cache.get(config.channels.suggestion);
  const suggestionMessages = await suggestionChannel.messages.fetch({ limit: 100 }, true);
  success(`Suggestion messages cached! (${suggestionMessages.size})`);

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
client.on('messageDelete', messageDeleteHandler);
client.on('messageReactionAdd', reactionAddHandler);
client.on('error', console.error);
client.on('warn', console.warn);
