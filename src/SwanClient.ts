import path from 'path';
import axios from 'axios';
import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import type { AkairoHandler, Category, Command } from 'discord-akairo';
import type { PermissionString } from 'discord.js';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import type { Query } from 'mongoose';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import CommandStat from './models/commandStat';
import SwanModule from './models/swanModule';
import * as resolvers from './resolvers';
import Logger from './structures/Logger';
import TaskHandler from './structures/TaskHandler';
import type {
  CommandStatDocument,
  SkriptMcDocumentationAddonResponse,
  SkriptMcDocumentationFullAddonResponse,
  SkriptToolsAddonListResponse,
  SwanModuleDocument,
} from './types';
import { uncapitalize } from './utils';

class SwanClient extends AkairoClient {
  constructor() {
    super({}, {
      // FIXME: Will break with discord.js v13
      disableMentions: 'everyone',
      ws: {
        intents: [
          'GUILDS', // Get access to channels, create some, pin messages etc.
          'GUILD_MEMBERS', // Access to GuildMemberAdd and GuildMemberRemove events (requires enabling via the discord dev portal).
          'GUILD_BANS', // Access to GuildBanAdd and GuildBanRemove events.
          'GUILD_PRESENCES', // Access to users' presence (for .userinfo).
          'GUILD_MESSAGES', // Access to Message, MessageDelete and MessageUpdate events.
          'GUILD_MESSAGE_REACTIONS', // Access to MessageReactionAdd events.
        ],
      },
    });

    this.redis = new Redis(process.env.REDIS_URI);
    void this.redis.subscribe('module');

    this.isLoading = true;

    this.cachedChannels = {
      idea: null,
      suggestions: null,
      bot: null,
      main: null,
      snippets: null,
      skriptHelp: null,
      otherHelp: null,
      help: null,
      skriptTalk: null,
      creations: null,
      log: null,
      privateChannelsCategory: null,
    };
    this.addonsVersions = [];
    this.skriptMcSyntaxes = [];
    this.githubCache = {};
    this.currentlyBanning = [];
    this.currentlyUnbanning = [];

    Logger.info('Creating Command handler...');
    this.commandHandler = new CommandHandler(this, {
      directory: path.join(__dirname, 'commands/'),
      prefix: settings.bot.prefix,
      aliasReplacement: /-/g,
      automateCategories: true,
      fetchMembers: true,
      commandUtil: true,
      storeMessages: true,
      argumentDefaults: {
        prompt: {
          retries: 3,
          time: 60_000,
          cancelWord: messages.prompt.cancelWord,
          stopWord: messages.prompt.stopWord,
          modifyStart: (_, text: string): string => text + messages.prompt.footer,
          modifyRetry: (_, text: string): string => text + messages.prompt.footer,
          timeout: messages.prompt.timeout,
          ended: messages.prompt.ended,
          cancel: messages.prompt.canceled,
        },
      },
    });

    Logger.info('Creating Inhibitor handler...');
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: path.join(__dirname, 'inhibitors/'),
      automateCategories: true,
    });

    Logger.info('Creating Task handler...');
    this.taskHandler = new TaskHandler(this, {
      directory: path.join(__dirname, 'tasks/'),
      automateCategories: true,
    });

    Logger.info('Creating Listener handler...');
    this.listenerHandler = new ListenerHandler(this, {
      directory: path.join(__dirname, 'listeners/'),
      automateCategories: true,
    });

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      taskHandler: this.taskHandler,
      listenerHandler: this.listenerHandler,
      mongodb: mongoose.connection,
      redis: this.redis,
      process,
    });

    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();
    this.on('ready', () => {
      this.taskHandler.loadAll();
    });

    // Unload modules from handlers if they are disabled (in the database)
    SwanModule.find().then((modules: SwanModuleDocument[]): void => {
      const unloadModules = (handler: AkairoHandler): void => {
        for (const id of handler.modules.keys()) {
          const module = modules.find(mod => mod.name === id);
          if (module && !module.enabled) {
            handler.remove(id);
            Logger.info(`Disabling module "${id}" (from ${handler.constructor.name})`);
          } else if (!module) {
            void SwanModule.create({ name: id, handler: uncapitalize(handler.constructor.name), enabled: true });
          }
        }
      };

      unloadModules(this.commandHandler);
      unloadModules(this.inhibitorHandler);
      unloadModules(this.listenerHandler);
      this.on('ready', () => {
        unloadModules(this.taskHandler);
      });
    });

    for (const [name, resolver] of Object.entries(resolvers))
      this.commandHandler.resolver.addType(name, resolver);

    void this._loadCommandStats();
    Logger.info('Loading addons from SkriptTools...');
    void this._loadSkriptToolsAddons();
    Logger.info('Loading syntaxes from Skript-MC...');
    void this._loadSkriptMcSyntaxes();

    Logger.info('Client initialization finished!');
  }

  public checkValidity(): void {
    if (!this.guild)
      return;

    // Check tokens
    if (!process.env.SENTRY_TOKEN)
      Logger.info('Disabling Sentry as the DSN was not set in the environment variables (SENTRY_TOKEN).');

    // Check channels IDs
    const channels = this.guild.channels.cache;
    for (const [key, value] of Object.entries(settings.channels)) {
      if (Array.isArray(value)) {
        if (value.length === 0)
          Logger.warn(`settings.channels.${key} is not set. You may want to fill this field to avoid any error.`);
        else if (!value.every(elt => channels.has(elt)))
          Logger.warn(`One of the id entered for settings.channels.${key} is not a valid channel.`);
      } else if (!value) {
        Logger.warn(`settings.channels.${key} is not set. You may want to fill this field to avoid any error.`);
      } else if (!channels.has(value)) {
        Logger.warn(`The id entered for settings.channels.${key} is not a valid channel.`);
      }
    }

    // Check roles IDs
    for (const [key, value] of Object.entries(settings.roles)) {
      if (!value)
        Logger.warn(`settings.roles.${key} is not set. You may want to fill this field to avoid any error.`);
      else if (!this.guild.roles.cache.has(value))
        Logger.warn(`The id entered for settings.roles.${key} is not a valid role.`);
    }

    // TODO: Also check for emojis IDs

    // Check client's server-level permissions
    const permissions: PermissionString[] = [
      'ADD_REACTIONS',
      'VIEW_CHANNEL',
      'SEND_MESSAGES',
      'MANAGE_MESSAGES',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
    ];
    if (!this.guild.me?.hasPermission(permissions))
      Logger.error(`Swan is missing Guild-Level permissions. Its cumulated roles' permissions does not contain one of the following: ${permissions.join(', ')}.`);

    // Check client's channels permissions
    for (const channel of channels.array()) {
      if (!channel.isText())
        continue;

      const channelPermissions = channel.permissionsFor(this.guild.me)?.toArray();
      if (channelPermissions && !permissions.every(perm => channelPermissions.includes(perm)))
        Logger.warn(`Swan is missing permission(s) ${permissions.filter(perm => !channelPermissions.includes(perm)).join(', ')} in channel "#${channel.name}".`);
    }
  }

  private async _loadCommandStats(): Promise<void> {
    const commandIds: string[] = this.commandHandler.categories
      .array()
      .flatMap((category: Category<string, Command>) => category.array())
      .map((cmd: Command) => cmd.id);

    // FIXME: Chances are I'm doing something wrong here. This might be done in a more elegant way.
    const documents: Array<Query<CommandStatDocument, CommandStatDocument, CommandStatDocument>> = [];
    for (const commandId of commandIds)
      documents.push(CommandStat.findOneAndUpdate({ commandId }, { commandId }, { upsert: true }));

    try {
      await Promise.all(documents);
    } catch (unknownError: unknown) {
      Logger.error('Could not load some documents:');
      Logger.error((unknownError as Error).stack);
    }
  }

  private async _loadSkriptToolsAddons(): Promise<void> {
    try {
      const allAddons: SkriptToolsAddonListResponse = await axios(settings.apis.addons).then(res => res?.data?.data);
      if (!allAddons)
        return;

      for (const addon of Object.keys(allAddons)) {
        const versions = allAddons[addon];
        if (versions)
          this.addonsVersions.push(versions[versions.length - 1]);
      }
    } catch (unknownError: unknown) {
      Logger.error("Could not load SkriptTool's addons:");
      Logger.error((unknownError as Error).stack);
    }
  }

  private async _loadSkriptMcSyntaxes(): Promise<void> {
    try {
      const token = `?api_key=${process.env.SKRIPTMC_DOCUMENTATION_TOKEN}`;
      const allAddons: SkriptMcDocumentationAddonResponse[] = await axios(`${settings.apis.skriptmc}addons${token}`).then(res => res?.data);
      if (!allAddons)
        return;

      // FIXME: Find a more optimized way of doing this, this is horrible
      // - Don't iterate through all syntaxes inside all addons... Double for loop and useless performance loss
      // - Don't do the async expression inside the loop
      // - Add an endpoint on the API to bulk-fetch syntaxes with already all of those information?
      for (const addon of allAddons) {
        try {
          const fullAddon: SkriptMcDocumentationFullAddonResponse = await axios(`${settings.apis.skriptmc}addons/${addon.slug}${token}`).then(res => res?.data);
          if (!fullAddon || !fullAddon.articles)
            throw new Error(`No syntax to load for addon ${addon.name}`);

          const addonObject = {
            name: addon.name,
            documentationUrl: addon.documentationUrl,
            dependency: addon.dependency,
          };

          for (const syntax of fullAddon.articles)
            syntax.addon = addonObject;

          this.skriptMcSyntaxes.push(...fullAddon.articles);
        } catch (unknownError: unknown) {
          Logger.error(`Could not load syntaxes from addon ${addon.name}`);
          Logger.error((unknownError as Error).stack);
          continue;
        }
      }
    } catch (unknownError: unknown) {
      Logger.error("Could not fetch Skript-MC's addons/syntaxes:");
      Logger.error((unknownError as Error).stack);
    }
  }
}

export default SwanClient;
