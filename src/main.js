import * as Integrations from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import moment from 'moment';
import mongoose from 'mongoose';
import SwanClient from './SwanClient';

dotenv.config();

moment.locale('fr');
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 55);
moment.relativeTimeThreshold('s', 55);
moment.relativeTimeThreshold('ss', 3);

const client = new SwanClient();
client.login(process.env.DISCORD_TOKEN);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.connection.on('connected', () => {
  client.logger.success('MongoDB is connected!');
});
mongoose.connection.on('error', (err) => {
  client.logger.error('MongoDB connection error. Please make sure MongoDB is running.');
  throw err;
});

if (process.env.NODE_ENV !== 'development' && process.env.SENTRY_TOKEN) {
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
