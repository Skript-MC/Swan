import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SwanClient from './SwanClient';

dotenv.config();

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
