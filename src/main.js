import * as Integrations from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import moment from 'moment';
import mongoose from 'mongoose';
import settings from '../config/settings';
import SwanClient from './SwanClient';
import Logger from './structures/Logger';

dotenv.config();

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

const client = new SwanClient();
client.login(process.env.DISCORD_TOKEN);

setTimeout(() => {
  if (client.readyAt === null) {
    Logger.error('Swan connection failed: the bot was not ready after 15s. Crashing.');
    process.exit(1); // eslint-disable-line node/no-process-exit
  }
}, settings.miscellaneous.connectionCheckDuration);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.connection.on('connected', () => {
  Logger.success('MongoDB is connected!');
});
mongoose.connection.on('error', (err) => {
  Logger.error('MongoDB connection error. Please make sure MongoDB is running.');
  throw err;
});

if (process.env.NODE_ENV !== 'development' && process.env.SENTRY_TOKEN) {
  Logger.info('Initializing Sentry');
  Sentry.init({
    dsn: process.env.SENTRY_TOKEN,
    release: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
    integrations: [
      // Debug is used to send details about handled errors
      new Integrations.CaptureConsole({ levels: ['debug', 'warn', 'error'] }),
      new Sentry.Integrations.OnUncaughtException({ onFatalError: (err) => { throw err; } }),
      new Sentry.Integrations.OnUnhandledRejection({ mode: 'strict' }),
    ],
  });
}
