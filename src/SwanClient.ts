import { LogLevel, SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import { GatewayIntentBits } from 'discord.js';
import { SwanCacheManager } from '#structures/SwanCacheManager';
import { SwanLogger } from '#structures/SwanLogger';
import { TaskStore } from '#structures/tasks/TaskStore';

export class SwanClient extends SapphireClient {
  constructor() {
    super({
      logger: {
        level: LogLevel.Info,
        instance: new SwanLogger(),
      },
      loadDefaultErrorListeners: true,

      intents: [
        GatewayIntentBits.Guilds, // Get access to channels, create some, pin messages etc.
        GatewayIntentBits.GuildMembers, // Access to GuildMemberAdd/GuildMemberRemove events.
        GatewayIntentBits.GuildModeration, // Access to GuildBanAdd and GuildBanRemove events.
        GatewayIntentBits.GuildPresences, // Access to users' presence (for .userinfo).
        GatewayIntentBits.GuildMessages, // Access to Message, MessageDelete and MessageUpdate events.
        GatewayIntentBits.GuildMessageReactions, // Access to MessageReactionAdd events.
        GatewayIntentBits.MessageContent, // Access to messages' content.
      ],
    });

    this.isLoading = true;

    this.logger = new SwanLogger();
    container.logger = this.logger;

    this.stores.register(new TaskStore());

    // Cache used internally to prevent unnecessary DB call when possible.
    this.cache = new SwanCacheManager();

    this.currentlyBanning = new Set();
    this.currentlyUnbanning = new Set();
    this.currentlyModerating = new Set();
  }
}
