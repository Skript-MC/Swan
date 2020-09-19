import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default {
  bot: {
    prefix: '.',
    avatar: path.join(__dirname, '..', 'assets', 'logo.png'),
    guild: process.env.GUILD_ID,
  },
  miscellaneous: {
    validNamePercentage: 0.5,
  },
  moderation: {
    purgeLimit: 50,
  },
  colors: {
    default: '#4286f4',
  },
  apis: {
    hastebin: 'https://hastebin.com/documents',
  },
  roles: {
    staff: process.env.STAFF_ROLE,
    activeMember: process.env.ACTIVE_MEMBER_ROLE,
  },
  channels: {
    idea: process.env.IDEA_CHANNEL,
    suggestions: process.env.SUGGESTIONS_CHANNEL,
    bot: process.env.BOT_CHANNEL,
    snippets: process.env.SNIPPETS_CHANNEL,
    skriptHelp: [...process.env.SKRIPT_HELP_CHANNELS.split(',')],
    otherHelp: [...process.env.OTHER_HELP_CHANNELS.split(',')],
    help: [...process.env.SKRIPT_HELP_CHANNELS.split(','), ...process.env.OTHER_HELP_CHANNELS.split(',')],
    skriptTalk: process.env.SKRIPT_TALK_CHANNEL,
  },
  emojis: {
    yes: process.env.YES_EMOJI || '✅',
    no: process.env.NO_EMOJI || '❌',
    remove: process.env.REMOVE_EMOJI || '🗑',
  },
};
