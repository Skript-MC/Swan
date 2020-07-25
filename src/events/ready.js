import { client, db } from '../main';
import Command from '../structures/Command';
import loadRssFeed from '../structures/RSSFeed';
import loadSkriptReleases from '../structures/skriptReleases';
import { randomActivity } from '../utils';
import DatabaseChecker from '../structures/DatabaseChecker';

export default async function readyHandler() {
  client.guild = client.guilds.resolve(client.config.bot.guild);

  client.checkValidity();
  client.logger.debug('main.js -> Checks of tokens, ids and permissions finished successfully');

  // Initializing the commands-stats database
  for (const command of client.commands) {
    const docs = await db.commandsStats.find({ command: command.name }).catch(console.error);
    if (docs.length > 0) continue;

    await db.commandsStats.insert({ command: command.name, used: 0 }).catch(console.error);
  }
  client.logger.debug('main.js -> commandsStats database initialized successfully');

  // Cache all messages that need to be cached
  const suggestionChannel = client.channels.resolve(client.config.channels.suggestion);
  const suggestionMessages = await suggestionChannel?.messages.fetch({ limit: 100 }, true);

  const polls = await db.polls.find({}).catch(console.error);
  const pollInfos = polls.map(poll => [poll.channel, poll.id]);
  const pollsMessagesCache = [];
  for (const [channelId, messageId] of pollInfos) {
    const channel = client.channels.resolve(channelId);
    pollsMessagesCache.push(channel?.messages.fetch(messageId, true));
  }
  await Promise.all(pollsMessagesCache);
  pollsMessagesCache.filter(elt => typeof elt !== 'undefined');

  client.logger.step(`Messages cached! (${(suggestionMessages?.size || 0) + (pollsMessagesCache?.length || 0)})`);
  client.logger.step('Skript-MC bot loaded!', true);

  Command.filterCooldown(client.commands);
  DatabaseChecker.checkSanctions(client, db);
  DatabaseChecker.checkPolls(client, db);
  loadRssFeed();
  loadSkriptReleases();
  client.user.setPresence(randomActivity(client, client.commands, client.config.bot.prefix));

  setInterval(() => {
    Command.filterCooldown(client.commands); // Tri dans les cooldowns des commandes
    DatabaseChecker.checkSanctions(client, db); // Vérification des sanctions temporaires
    DatabaseChecker.checkPolls(client, db); // Vérification des sondages
  }, client.config.bot.checkInterval.short);

  setInterval(() => {
    loadRssFeed(); // Chargement des flux RSS
    loadSkriptReleases(); // Vérification si une nouvelle version de Skript est sortie
    // On remet l'activité du bot (sinon elle s'enlève toute seule au bout d'un moment) :
    client.user.setPresence(randomActivity(client, client.commands, client.config.bot.prefix));
  }, client.config.bot.checkInterval.long);
}
