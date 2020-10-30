export default {
  RULES: {
    ONLY_BOT_CHANNEL: 1,
    NO_HELP_CHANNEL: 2,
    ONLY_HELP_CHANNEL: 3,
  },
  SANCTIONS: {
    TYPES: {
      HARDBAN: 'hardban',
      BAN: 'ban',
      MUTE: 'mute',
      WARN: 'warn',
      KICK: 'kick',
      UNBAN: 'unban',
      UNMUTE: 'unmute',
      REMOVE_WARN: 'removeWarn',
    },
    UPDATES: {
      REVOKED: 'revoked',
      REASON: 'reason',
      DURATION: 'duration',
    },
  },
};
