import type { HexColorString } from 'discord.js';
import type { SwanCommandOptions } from '@/app/types';
import { basePreconditions } from '@/conf/configUtils';

const skriptHelp = [...process.env.SKRIPT_HELP_CHANNELS.split(',')];
const skriptExtraHelp = [...process.env.SKRIPT_EXTRA_HELP_CHANNELS.split(',')];
const otherHelp = [...process.env.OTHER_HELP_CHANNELS.split(',')];

export default {
  bot: {
    prefix: process.env.BOT_PREFIX || '/',
    avatar: 'https://raw.githubusercontent.com/Skript-MC/Swan/01f67192c18107a2f9a47beb4f7a082ac63696be/assets/logo.png',
    guild: process.env.GUILD_ID,
  },
  miscellaneous: {
    sentryFlush: 4 * 1000, // 4 seconds in milliseconds
    maxPollDuration: 60 * 60 * 24 * 7 * 1000, // 7 days in seconds
    reactionNumbers: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'],
    pollReactions: {
      yesno: ['✅', '❌'],
      multiple: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'],
      specials: ['ℹ', '🛑'],
    },
    validNamePercentage: 0.5,
    durationFormat: '[le] DD/MM/YYYY [à] HH:mm:ss',
    permanentKeywords: ['def', 'déf', 'definitif', 'définitif', 'perm', 'perma', 'permanent'],
    hastebinExtensions: ['.sk', '.yml', '.yaml', '.txt', '.json', '.js', '.ts', '.md', '.java'],
    connectionCheckDuration: 15_000, // 15 seconds in milliseconds
    activeMemberBlacklistedLinks: [
      'skripthub.net/docs',
      'docs.skunity.com',
    ],
    booleanTruths: ['oui', 'o', 'yes', 'y', 'vrai', 'v', 'true', 't', 'on'],
    booleanFalses: ['non', 'no', 'n', 'faux', 'f', 'false', 'off'],
  },
  globalCommandsOptions: {
    generateDashLessAliases: true,
    preconditions: basePreconditions,
  } as Partial<SwanCommandOptions>,
  moderation: {
    purgeLimit: 50,
    warnDuration: 60 * 60 * 24 * 30, // 1 month in seconds
    warnLimitBeforeBan: 2,
    warnLimitBanDuration: 60 * 60 * 24 * 4, // 4 days in seconds
    maximumDurationForumModerator: 60 * 60 * 24 * 2, // 2 days in seconds
    banChannelPrefix: 'b-',
    banChannelTopic: "Salon du bannissement de {member.displayName}. Regardez les messages épinglés pour plus d'informations.",
    dashboardSanctionLink: 'https://swan.skript-mc.fr/sanctions?memberId=',
    colors: {
      warn: '#ffe200' as HexColorString,
      kick: '#ff6b61' as HexColorString,
      mute: '#8100eb' as HexColorString,
      ban: '#cc3300' as HexColorString,
      hardban: '#000000' as HexColorString,
      unban: '#1fc622' as HexColorString,
      unmute: '#1fc622' as HexColorString,
      removeWarn: '#1fc622' as HexColorString,
    },
  },
  colors: {
    default: '#4286f4' as HexColorString,
    success: '#1fc622' as HexColorString,
    error: '#ff6b61' as HexColorString,
    light: '#a2d2ff' as HexColorString,
  },
  apis: {
    addons: 'https://api.skripttools.net/v4/addons',
    skriptmc: 'https://skript-mc.fr/api',
    forum: 'https://skript-mc.fr/forum/api',
    server: 'https://api.mcsrvstat.us/2',
    latex: 'https://latex.codecogs.com/png.image?',
  },
  roles: {
    staff: process.env.STAFF_ROLE,
    forumModerator: process.env.FORUM_MODERATOR_ROLE,
    everyone: process.env.EVERYONE_ROLE,
    activeMember: process.env.ACTIVE_MEMBER_ROLE,
    ban: process.env.BAN_ROLE,
    mute: process.env.MUTE_ROLE,
  },
  channels: {
    idea: process.env.IDEA_CHANNEL,
    suggestions: process.env.SUGGESTIONS_CHANNEL,
    bot: process.env.BOT_CHANNEL,
    main: process.env.MAIN_CHANNEL,
    snippets: process.env.SNIPPETS_CHANNEL,
    skriptHelp,
    skriptExtraHelp,
    otherHelp,
    help: [skriptHelp, skriptExtraHelp, otherHelp].flat(),
    skriptTalk: process.env.SKRIPT_TALK_CHANNEL,
    creations: process.env.SKRIPT_CREATIONS_CHANNEL,
    log: process.env.LOG_CHANNEL,
    privateChannelsCategory: process.env.PRIVATE_CHANNEL_CATEGORY,
    forumUpdates: process.env.FORUM_FEED_CHANNEL,
  },
  emojis: {
    yes: process.env.YES_EMOJI || '✅',
    no: process.env.NO_EMOJI || '❌',
    remove: process.env.REMOVE_EMOJI || '🗑️',
  },
};
