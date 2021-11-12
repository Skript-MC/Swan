import path from 'node:path';
import axios from 'axios';
import type { AkairoHandler, Category, Command } from 'discord-akairo';
import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import type { PermissionString } from 'discord.js';
import { Intents } from 'discord.js';
import type { Query } from 'mongoose';
import mongoose from 'mongoose';
import CommandStat from '@/app/models/commandStat';
import Poll from '@/app/models/poll';
import ReactionRole from '@/app/models/reactionRole';
import SwanModule from '@/app/models/swanModule';
import * as resolvers from '@/app/resolvers';
import Logger from '@/app/structures/Logger';
import SwanCacheManager from '@/app/structures/SwanCacheManager';
import TaskHandler from '@/app/structures/TaskHandler';
import type {
  CommandStatDocument,
  SkriptMcDocumentationFullAddonResponse,
  SkriptMcDocumentationSyntaxResponse,
  SkriptToolsAddonListResponse,
  SwanModuleDocument,
} from '@/app/types';
import { nullop, uncapitalize } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class SwanClient extends AkairoClient {
  constructor() {
    super({}, {
      // FIXME: Will break with discord.js v13
      disableMentions: 'everyone',
      ws: {
        intents: [
          Intents.FLAGS.GUILDS, // Get access to channels, create some, pin messages etc.
          Intents.FLAGS.GUILD_MEMBERS, // Access to GuildMemberAdd/GuildMemberRemove events.
          Intents.FLAGS.GUILD_BANS, // Access to GuildBanAdd and GuildBanRemove events.
          Intents.FLAGS.GUILD_PRESENCES, // Access to users' presence (for .userinfo).
          Intents.FLAGS.GUILD_MESSAGES, // Access to Message, MessageDelete and MessageUpdate events.
          Intents.FLAGS.GUILD_MESSAGE_REACTIONS, // Access to MessageReactionAdd events.
        ],
      },
    });

    this.isLoading = true;

    // Cache used internally to prevent unnecessary DB call when possible.
    this.cache = new SwanCacheManager();

    this.currentlyBanning = new Set();
    this.currentlyUnbanning = new Set();
    this.currentlyModerating = new Set();

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
      process,
    });

    // We start by loading all modules.
    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();

    this.cache.modules = [
      ...this.commandHandler.modules.array(),
      ...this.inhibitorHandler.modules.array(),
      ...this.listenerHandler.modules.array(),
    ];

    // When the bot is ready, fetch the database and unload modules that needs to be unloaded (disabled via the panel).
    this.on('ready', () => {
      this.taskHandler.loadAll();
      this.cache.modules = [...this.cache.modules, ...this.taskHandler.modules.array()];

      SwanModule.find()
        .then((modules: SwanModuleDocument[]): void => {
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
          unloadModules(this.taskHandler);
        })
        .catch((error: Error) => {
          Logger.error("Unable to load modules from Database. Synchronisation with the panel won't work.");
          Logger.error(error.message);
        });
    });

    // We add all needed resolvers to the type resolver.
    for (const [name, resolver] of Object.entries(resolvers))
      this.commandHandler.resolver.addType(name, resolver);

    Logger.info('Loading & caching databases...');
    void this._loadPolls();
    void this._loadCommandStats();
    void this._loadReactionRoles();

    Logger.info('Loading addons from SkriptTools...');
    void this._loadSkriptToolsAddons();
    Logger.info('Loading syntaxes from Skript-MC...');
    void this._loadSkriptMcSyntaxes();

    Logger.info('Client initialization finished!');
  }

  public checkValidity(): void {
    if (!this.guild)
      return;

    // Check tokens.
    if (!process.env.SENTRY_TOKEN)
      Logger.info('Disabling Sentry as the DSN was not set in the environment variables (SENTRY_TOKEN).');

    // Check channels IDs.
    const channels = this.guild.channels.cache;
    const invalidChannels: string[] = [];
    for (const [key, value] of Object.entries(settings.channels)) {
      if (Array.isArray(value)) {
        if (value.length === 0)
          invalidChannels.push(`settings.channels.${key} is not set. You may want to fill this field to avoid any error.`);
        else if (!value.every(elt => channels.has(elt)))
          invalidChannels.push(`One of the id entered for settings.channels.${key} is not a valid channel.`);
      } else if (!value) {
        invalidChannels.push(`settings.channels.${key} is not set. You may want to fill this field to avoid any error.`);
      } else if (!channels.has(value)) {
        invalidChannels.push(`The id entered for settings.channels.${key} is not a valid channel.`);
      }
    }
    if (invalidChannels.length > 0) {
      Logger.error('Configured channels are invalid:');
      for (const error of invalidChannels)
        Logger.detail(error);
      if (process.env.NODE_ENV === 'production')
        throw new Error('Please fill correctly the configuration to start the bot.');
    }

    // Check roles IDs.
    for (const [key, value] of Object.entries(settings.roles)) {
      if (!value)
        Logger.warn(`settings.roles.${key} is not set. You may want to fill this field to avoid any error.`);
      else if (!this.guild.roles.cache.has(value))
        Logger.warn(`The id entered for settings.roles.${key} is not a valid role.`);
    }

    // TODO: Also check for emojis IDs.

    // Check client's server-level permissions.
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

    // Check client's channels permissions.
    for (const channel of channels.array()) {
      if (!channel.isText())
        continue;

      const channelPermissions = channel.permissionsFor(this.guild.me)?.toArray();
      if (channelPermissions && !permissions.every(perm => channelPermissions.includes(perm)))
        Logger.warn(`Swan is missing permission(s) ${permissions.filter(perm => !channelPermissions.includes(perm)).join(', ')} in channel "#${channel.name}".`);
    }
  }

  private async _loadPolls(): Promise<void> {
    // Cache all polls' messages' ids.
    const polls = await Poll.find().catch(nullop);
    if (polls)
      this.cache.pollMessagesIds.addAll(...polls.map(poll => poll.messageId));
  }

  private async _loadCommandStats(): Promise<void> {
    // Add all needed commands not present in the DB, to DB.
    const commandIds: string[] = this.commandHandler.categories
      .array()
      .flatMap((category: Category<string, Command>) => category.array())
      .map((cmd: Command) => cmd.id);

    // FIXME: Chances are I'm doing something wrong here. This might be done in a more elegant way.
    const documents: Array<Query<CommandStatDocument | null, CommandStatDocument>> = [];
    for (const commandId of commandIds)
      documents.push(CommandStat.findOneAndUpdate({ commandId }, { commandId }, { upsert: true }));

    try {
      await Promise.all(documents);
    } catch (unknownError: unknown) {
      Logger.error('Could not load some documents:');
      Logger.error((unknownError as Error).stack);
    }
  }

  private async _loadReactionRoles(): Promise<void> {
    // Cache all reaction roles' messages' ids.
    const reactionRoles = await ReactionRole.find().catch(nullop);
    if (reactionRoles)
      this.cache.reactionRolesIds.addAll(...reactionRoles.map(document => document.messageId));
  }

  private async _loadSkriptToolsAddons(): Promise<void> {
    // Fetch all addons' versions from their APIs, and add them to the array, to make it easier to fetch
    // them later (becase we need their versions in the URL to fetch them.)
    try {
      const allAddons: SkriptToolsAddonListResponse = await axios(settings.apis.addons).then(res => res?.data?.data);
      if (!allAddons)
        return;

      for (const addon of Object.keys(allAddons)) {
        const versions = allAddons[addon];
        if (versions)
          this.cache.addonsVersions.push(versions[versions.length - 1]);
      }
    } catch (unknownError: unknown) {
      Logger.error("Could not load SkriptTool's addons:");
      Logger.error((unknownError as Error).stack);
    }
  }

  private async _loadSkriptMcSyntaxes(): Promise<void> {
    // Load all syntaxes from Skript-MC's API.
    try {
      // TODO: Handle rate-limits. Currently set at 200 requests/hour, but with thoses 2 endpoints,
      // we consume 11 requests. See https://skript-mc.fr/api#quotas
      const token = `api_key=${process.env.SKRIPTMC_DOCUMENTATION_TOKEN}`;
      const allSyntaxes: SkriptMcDocumentationSyntaxResponse[] = await axios(`${settings.apis.skriptmc}syntaxes?${token}`)
        .then(res => res?.data);
      const allAddons: SkriptMcDocumentationFullAddonResponse[] = await axios(`${settings.apis.skriptmc}addons?${token}`)
        .then(res => res?.data);

      for (const syntax of allSyntaxes) {
        const addon = allAddons.find(adn => adn.name.toLowerCase() === syntax.addon.toLowerCase());
        if (!addon)
          continue;
        const result = /(?<englishName>.+) \((?<frenchName>.*?)\)/g.exec(syntax.name);
        if (result?.groups) {
          const { englishName, frenchName } = result.groups;
          if (englishName && frenchName) {
            syntax.englishName = englishName;
            syntax.frenchName = frenchName;
          }
        }
        const syntaxWithAddon = {
          ...syntax,
          addon: {
            name: addon.name,
            documentationUrl: addon.documentationUrl,
            dependency: addon.dependency,
          },
        };
        this.cache.skriptMcSyntaxes.push(syntaxWithAddon);
      }
    } catch (unknownError: unknown) {
      Logger.error("Could not fetch Skript-MC's addons/syntaxes:");
      Logger.error((unknownError as Error).stack);
    }
  }
}

export default SwanClient;
