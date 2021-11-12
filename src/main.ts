import 'core-js/proposals/collection-methods';
import 'source-map-support/register';
import 'module-alias/register';
import 'dotenv/config';

import * as Sentry from '@sentry/node';
import moment from 'moment';
import mongoose from 'mongoose';
import settings from '@/conf/settings';
import SwanClient from './SwanClient';
import Logger from './structures/Logger';

// We configure momentjs to be stricter on date rounding.
moment.locale('fr');
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 55);
moment.relativeTimeThreshold('s', 55);
moment.relativeTimeThreshold('ss', 3);

if (!process.env.DISCORD_TOKEN) {
  Logger.error('Discord token was not set in the environment variables (DISCORD_TOKEN)');
  throw new Error('Unable to load Swan, stopping.');
}

void mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const client = new SwanClient();
void client.login(process.env.DISCORD_TOKEN);

setTimeout(() => {
  if (client.readyAt === null) {
    Logger.error('Swan connection failed: the bot was not ready after 15s. Crashing.');
    process.exit(1); // eslint-disable-line node/no-process-exit
  }
}, settings.miscellaneous.connectionCheckDuration);

if (process.env.NODE_ENV !== 'development' && process.env.SENTRY_TOKEN) {
  Logger.info('Initializing Sentry...');
  Sentry.init({
    dsn: process.env.SENTRY_TOKEN,
    release: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
  });
}
