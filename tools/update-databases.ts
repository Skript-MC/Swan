import 'source-map-support/register';
import 'module-alias/register';
import 'dotenv/config';

import mongoose from 'mongoose';
import Sanction from '../src/models/sanction';

async function start(): Promise<void> {
  console.log('Connecting to database...');

  await mongoose.connect(process.env.MONGO_URI);
  mongoose.connection.on('connected', () => {
    console.log('MongoDB is connected!');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error. Please make sure MongoDB is running.');
    throw err;
  });

  console.log('Converting...');
  // eslint-disable-next-line @typescript-eslint/naming-convention
  await Sanction.updateMany({ type: 'ban' }, { 'informations.hasSentMessages': true });
  console.log('Conversion was successful!');
  // eslint-disable-next-line node/no-process-exit
  process.exit(0);
}
void start();
