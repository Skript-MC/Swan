import { LogLevel, SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import { Intents } from 'discord.js';
import SwanModule, { allowedStores } from '@/app/models/swanModule';
import SwanCacheManager from '@/app/structures/SwanCacheManager';
import SwanLogger from '@/app/structures/SwanLogger';
import TaskStore from '@/app/structures/tasks/TaskStore';
import type { SwanModuleDocument } from '@/app/types';
import settings from '@/conf/settings';

export default class SwanClient extends SapphireClient {
  constructor() {
    super({
      caseInsensitiveCommands: true,
      caseInsensitivePrefixes: true,
      defaultPrefix: settings.bot.prefix,
      logger: {
        level: LogLevel.Info,
        instance: new SwanLogger(),
      },
      loadDefaultErrorListeners: true,

      intents: [
        Intents.FLAGS.GUILDS, // Get access to channels, create some, pin messages etc.
        Intents.FLAGS.GUILD_MEMBERS, // Access to GuildMemberAdd/GuildMemberRemove events.
        Intents.FLAGS.GUILD_BANS, // Access to GuildBanAdd and GuildBanRemove events.
        Intents.FLAGS.GUILD_PRESENCES, // Access to users' presence (for .userinfo).
        Intents.FLAGS.GUILD_MESSAGES, // Access to Message, MessageDelete and MessageUpdate events.
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS, // Access to MessageReactionAdd events.
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

  public async refreshPieces(): Promise<void> {
    const modules: SwanModuleDocument[] = await SwanModule.find();

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
            enabled: true,
          });
        }
      }
    }
  }
}
