import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default {
  bot: {
    prefix: '.',
    avatar: path.join(__dirname, '..', 'assets', 'logo.png'),
  },
  moderation: {
    purgeLimit: 50,
  },
  emojis: {
    yes: '755446079855526051',
    no: '❌',
  },
  colors: {
    default: '#4286f4',
  },
  roles: {
    staff: process.env.STAFF_ROLE,
  },
  channels: {
    idea: process.env.IDEA_CHANNEL,
  },
};
