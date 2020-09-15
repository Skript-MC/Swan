import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default {
  bot: {
    prefix: '.',
    avatar: path.join(__dirname, '..', 'assets', 'logo.png'),
  },
  colors: {
    default: '#4286f4',
  },
  roles: {
    staff: process.env.STAFF_ROLE,
  },
  roles: {
    staff: process.env.ROLE_STAFF,
  },
};
