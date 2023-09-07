import { LogLevel, SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import { GatewayIntentBits } from 'discord.js';
import { allowedStores, SwanModule } from '#models/swanModule';
import { SwanCacheManager } from '#structures/SwanCacheManager';
import { SwanLogger } from '#structures/SwanLogger';
import { TaskStore } from '#structures/tasks/TaskStore';
import type { SwanModuleDocument } from '#types/index';

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

  public async refreshPieces(force = false): Promise<void> {
    let modules: SwanModuleDocument[] = [];
    if (force)
      await SwanModule.deleteMany({});
    else
      modules = await SwanModule.find({});

    for (const [storeName, store] of this.stores) {
      if (!allowedStores.includes(storeName))
        continue;
      for (const piece of store.values()) {
        const module = modules.find(mod => mod.name === piece.name && mod.store === storeName);
        if (module && !module.enabled) {
          await store.unload(piece.name);
          this.logger.info(`Disabling module "${piece.name}" (from ${storeName})`);
        } else if (!module) {
          await SwanModule.create({
            name: piece.name,
            store: storeName,
            location: piece.location,
            enabled: true,
          });
        }
      }
    }
  }
}
