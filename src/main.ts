import '@sapphire/plugin-logger/register';
import 'dotenv/config';
import 'reflect-metadata';

import * as Sentry from '@sentry/node';
import moment from 'moment';
import mongoose from 'mongoose';
import { SwanClient } from '#app/SwanClient';
import { miscellaneous } from '#config/settings';

// We configure momentjs to be stricter on date rounding.
moment.locale('fr');
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 55);
moment.relativeTimeThreshold('s', 55);
moment.relativeTimeThreshold('ss', 3);

if (!process.env.DISCORD_TOKEN) {
  console.error('Discord token was not set in the environment variables (DISCORD_TOKEN)');
  throw new Error('Unable to load Swan, stopping.');
}

async function bootstrap(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI);

  const client = new SwanClient();
  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error: unknown) {
    client.logger.fatal(error as Error);
    await client.destroy();
    throw (error as Error);
  }

  setTimeout(() => {
    if (client.readyAt === null) {
      client.logger.error('Swan connection failed: the bot was not ready after 15s. Crashing.');
      process.exit(1); // eslint-disable-line node/no-process-exit
    }
  }, miscellaneous.connectionCheckDuration);

  if (process.env.NODE_ENV !== 'development' && process.env.SENTRY_TOKEN) {
    client.logger.info('Initializing Sentry...');
    Sentry.init({
      dsn: process.env.SENTRY_TOKEN,
      release: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
    });
  }
}

void bootstrap();
