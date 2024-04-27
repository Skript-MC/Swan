import type { HexColorString } from 'discord.js';
import type { SwanCommandOptions } from '#types/index';

export const bot = {
  avatar:
    'https://raw.githubusercontent.com/Skript-MC/Swan/01f67192c18107a2f9a47beb4f7a082ac63696be/assets/logo.png',
  guild: process.env.GUILD_ID,
} as const;

export const miscellaneous = {
  sentryFlush: 4 * 1000, // 4 seconds in milliseconds
  maxPollDuration: 60 * 60 * 24 * 7 * 1000, // 7 days in seconds
  pollReactions: {
    yesno: ['✅', '❌'],
    multiple: [
      '1⃣',
      '2⃣',
      '3⃣',
      '4⃣',
      '5⃣',
      '6⃣',
      '7⃣',
      '8⃣',
      '9⃣',
      '🔟',
      '🇦',
      '🇧',
      '🇨',
      '🇩',
      '🇪',
      '🇫',
      '🇬',
      '🇭',
    ],
    specials: ['ℹ', '🛑'],
  },
  durationFormat: '[le] DD/MM/YYYY [à] HH:mm:ss',
  permanentKeywords: [
    'def',
    'déf',
    'definitif',
    'définitif',
    'perm',
    'perma',
    'permanent',
  ],
  connectionCheckDuration: 15_000, // 15 seconds in milliseconds
} satisfies Record<string, unknown>;

export const globalCommandsOptions = {
  preconditions: ['NotLoading'],
} as Partial<SwanCommandOptions>;

export const moderation = {
  purgeLimit: 50,
  warnDuration: 60 * 60 * 24 * 30, // 1 month in seconds
  warnLimitBeforeBan: 2,
  warnLimitBanDuration: 60 * 60 * 24 * 4, // 4 days in seconds
  dashboardSanctionLink: 'https://swan.skript-mc.fr/sanctions?memberId=',
  colors: {
    warn: '#ffe200',
    kick: '#ff6b61',
    mute: '#8100eb',
    tempBan: '#cc3300',
    hardban: '#000000',
    unban: '#1fc622',
    unmute: '#1fc622',
    removeWarn: '#1fc622',
  } satisfies Record<string, HexColorString>,
} as const;

export const colors = {
  default: '#4286f4',
  success: '#1fc622',
  error: '#ff6b61',
  light: '#a2d2ff',
} satisfies Record<string, HexColorString>;

export const apis = {
  addons: 'https://api.skripttools.net/v4/addons',
  skriptmc: 'https://skript-mc.fr/api',
  forum: 'https://skript-mc.fr/forum/api',
  server: 'https://api.mcsrvstat.us',
  latex: 'https://latex.codecogs.com/png.image?',
} as const;

export const roles = {
  staff: process.env.STAFF_ROLE,
  everyone: process.env.EVERYONE_ROLE,
  ban: process.env.BAN_ROLE,
} as const;

export const channels = {
  idea: process.env.IDEA_CHANNEL,
  suggestions: process.env.SUGGESTIONS_CHANNEL,
  main: process.env.MAIN_CHANNEL,
  snippets: process.env.SNIPPETS_CHANNEL,
  skriptTalk: process.env.SKRIPT_TALK_CHANNEL,
  log: process.env.LOG_CHANNEL,
  forumUpdates: process.env.FORUM_FEED_CHANNEL,
  banChannel: process.env.BAN_CHANNEL,
} satisfies Record<string, string[] | string>;

export const emojis = {
  yes: process.env.YES_EMOJI || '✅',
  no: process.env.NO_EMOJI || '❌',
  remove: process.env.REMOVE_EMOJI || '🗑️',
} as const;
