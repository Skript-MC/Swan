import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default {
  bot: {
    prefix: process.env.BOT_PREFIX || '.',
    avatar: path.join(__dirname, '..', 'assets', 'logo.png'),
    guild: process.env.GUILD_ID,
  },
  miscellaneous: {
    maxPollDuration: 60 * 60 * 24 * 7, // 7 days in seconds
    reactionNumbers: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'],
    pollReactions: {
      yesno: ['✅', '❌'],
      multiple: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'],
      specials: ['ℹ', '🛑'],
    },
    validNamePercentage: 0.5,
    durationFormat: '[à] HH:mm:ss [le] DD/MM/YYYY',
    hastebinExtensions: ['.sk', '.yml', '.yaml', '.txt', '.json', '.js', '.ts', '.md', '.java'],
    connectionCheckDuration: 15_000, // 15 seconds in milliseconds
    activeMemberBlacklistedLinks: [
      'skripthub.net/docs',
      'docs.skunity.com',
    ],
  },
  moderation: {
    purgeLimit: 50,
    warnDuration: 60 * 60 * 24 * 30, // 1 month in seconds
    warnLimitBeforeBan: 2,
    warnLimitBanDuration: 60 * 60 * 24 * 4, // 4 days in seconds
    maximumDurationForumModerator: 60 * 60 * 24 * 2, // 2 days in seconds
    banChannelPrefix: 'b-',
    banChannelTopic: "Salon du bannissement de {member.displayName}. Regardez les messages épinglés pour plus d'informations.",
    colors: {
      warn: '#ffe200',
      kick: '#ff6b61',
      mute: '#8100eb',
      ban: '#cc3300',
      hardban: '#000000',
      unban: '#1fc622',
      unmute: '#1fc622',
      removeWarn: '#1fc622',
    },
  },
  colors: {
    default: '#4286f4',
    success: '#1fc622',
  },
  apis: {
    hastebin: 'https://hastebin.com/documents',
    addons: 'https://api.skripttools.net/v4/addons/',
    skriptmc: 'https://skript-mc.fr/api/',
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
    skriptHelp: [...process.env.SKRIPT_HELP_CHANNELS.split(',')],
    otherHelp: [...process.env.OTHER_HELP_CHANNELS.split(',')],
    help: [...process.env.SKRIPT_HELP_CHANNELS.split(','), ...process.env.OTHER_HELP_CHANNELS.split(',')],
    skriptTalk: process.env.SKRIPT_TALK_CHANNEL,
    creations: process.env.SKRIPT_CREATIONS_CHANNEL,
    log: process.env.LOG_CHANNEL,
    privateChannelsCategory: process.env.PRIVATE_CHANNEL_CATEGORY,
  },
  emojis: {
    yes: process.env.YES_EMOJI || '✅',
    no: process.env.NO_EMOJI || '❌',
    remove: process.env.REMOVE_EMOJI || '🗑️',
  },

};
