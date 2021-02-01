declare namespace NodeJS {
  interface ProcessEnv {
    /* eslint @typescript-eslint/naming-convention: ["error", {
      selector: 'memberLike',
      format: ['UPPER_CASE'],
      leadingUnderscore: 'forbid',
      trailingUnderscore: 'forbid',
    }] */
    NODE_ENV: string;

    BOT_PREFIX: string;

    DISCORD_TOKEN: string;
    SENTRY_TOKEN: string;
    SKRIPTMC_DOCUMENTATION_TOKEN: string;
    SKRIPTMC_FORUM_TOKEN: string;

    MONGO_URI: string;
    REDIS_URI: string;

    GUILD_ID: string;

    STAFF_ROLE: string;
    FORUM_MODERATOR_ROLE: string;
    EVERYONE_ROLE: string;
    ACTIVE_MEMBER_ROLE: string;
    BAN_ROLE: string;
    MUTE_ROLE: string;

    SKRIPT_TALK_CHANNEL: string;
    IDEA_CHANNEL: string;
    SUGGESTIONS_CHANNEL: string;
    BOT_CHANNEL: string;
    SNIPPETS_CHANNEL: string;
    SKRIPT_CREATIONS_CHANNEL: string;
    SKRIPT_HELP_CHANNELS: string;
    OTHER_HELP_CHANNELS: string;
    LOG_CHANNEL: string;
    PRIVATE_CHANNEL_CATEGORY: string;
    MAIN_CHANNEL: string;
    FORUM_FEED_CHANNEL: string;

    YES_EMOJI: string;
    NO_EMOJI: string;
    REMOVE_EMOJI: string;
  }
}
