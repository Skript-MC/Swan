import moment from 'moment';
import * as Sentry from '@sentry/node';
import * as Integrations from '@sentry/integrations';
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

export const client = new SwanClient({
  ws: {
    intents: [
      'GUILDS', // Access to channels, create some, pin messages etc etc
      'GUILD_MEMBERS', // Access to GuildMemberAdd and GuildMemberRemove events (requires enabling via the discord dev portal)
      'GUILD_BANS', // Access to GuildBanAdd and GuildBanRemove events
      'GUILD_VOICE_STATES', // Access to VoiceStateUpdate event
      'GUILD_PRESENCES', // Access to users' presence (for .userinfo)
      'GUILD_MESSAGES', // Access to Message, MessageDelete and MessageUpdate events
      'GUILD_MESSAGE_REACTIONS', // Access to MessageReactionAdd events
    ],
  },
});
export const db = loadDatabases(client);

const shouldLoadSyntaxes = client.config.messages.commands.syntaxinfo.enabled ?? true;
const shouldLoadAddons = client.config.messages.commands.addoninfo.enabled ?? true;
export const SkriptHubSyntaxes = shouldLoadSyntaxes ? loadSkriptHubAPI(client) : null;
export const SkripttoolsAddons = shouldLoadAddons ? loadSkripttoolsAddons(client) : null;

client.on('error', (err) => { throw new Error(err); });
client.on('warn', client.logger.warn);

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({ dsn: process.env.SENTRY_API,
    integrations: [
      new Integrations.CaptureConsole({ levels: ['warn', 'error'] }),
      new Sentry.Integrations.OnUncaughtException({ onFatalError: (err) => { throw new Error(err); } }),
      new Sentry.Integrations.OnUnhandledRejection({ mode: 'strict' }), // Fait passer l'UnhandledRejection comme UncaughtException
    ] });
}
