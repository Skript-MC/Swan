import 'dotenv/config';
import mongoose from 'mongoose';

async function start() {
  console.log('Connecting to database...');

  await mongoose.connect(process.env.MONGO_URI);
  mongoose.connection.on('connected', () => {
    console.log('MongoDB is connected!');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error. Please make sure MongoDB is running.');
    throw err;
  });

  const Sanction = mongoose.model('Sanction');

  console.log('Converting...');
  await Sanction.updateMany({ type: 'ban' }, { type: 'tempBan' });
  await Sanction.updateMany({}, { $rename: { memberId: 'userId' } }, { strict: false });
  console.log('Conversion was successful!');
  // eslint-disable-next-line node/no-process-exit
  process.exit(0);
}
void start();
