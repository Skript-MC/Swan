declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;

    DISCORD_TOKEN: string;
    SENTRY_TOKEN: string;
    SKRIPTMC_DOCUMENTATION_TOKEN: string;
    SKRIPTMC_FORUM_TOKEN: string;

    MONGO_URI: string;

    GUILD_ID: string;

    STAFF_ROLE: string;
    EVERYONE_ROLE: string;
    BAN_ROLE: string;

    SKRIPT_TALK_CHANNEL: string;
    IDEA_CHANNEL: string;
    SUGGESTIONS_CHANNEL: string;
    SNIPPETS_CHANNEL: string;
    SANCTION_LOG_CHANNEL: string;
    DISCORD_LOG_CHANNEL: string;
    BAN_CHANNEL: string;
    MAIN_CHANNEL: string;
    FORUM_FEED_CHANNEL: string;

    YES_EMOJI: string;
    NO_EMOJI: string;
    REMOVE_EMOJI: string;
  }
}
