import path from 'node:path';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import axios from 'axios';
import { Intents, Permissions } from 'discord.js';
import type { Query } from 'mongoose';
import CommandStat from '@/app/models/commandStat';
import Poll from '@/app/models/poll';
import ReactionRole from '@/app/models/reactionRole';
import SwanModule from '@/app/models/swanModule';
import SwanCacheManager from '@/app/structures/SwanCacheManager';
import TaskStore from '@/app/structures/tasks/TaskStore';
import type {
  CommandStatDocument,
  SkriptMcDocumentationFullAddonResponse,
  SkriptMcDocumentationSyntaxResponse,
  SkriptToolsAddonListResponse,
  SwanModuleDocument,
} from '@/app/types';
import { nullop } from '@/app/utils';
import settings from '@/conf/settings';

export default class SwanClient extends SapphireClient {
  constructor() {
    super({
      caseInsensitiveCommands: true,
      caseInsensitivePrefixes: true,
      defaultPrefix: settings.bot.prefix,
      logger: {
        level: LogLevel.Debug,
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

    this.stores.register(new TaskStore());

    // Cache used internally to prevent unnecessary DB call when possible.
    this.cache = new SwanCacheManager();

    this.currentlyBanning = new Set();
    this.currentlyUnbanning = new Set();
    this.currentlyModerating = new Set();

    // When the bot is ready, fetch the database and unload modules that needs to be unloaded (disabled via the panel).
    this.once('ready', async () => {
      const modules: SwanModuleDocument[] = await SwanModule.find();

      for (const [storeName, store] of this.stores) {
        if (storeName === 'arguments')
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
              location: {
                root: piece.location.root,
                relative: path.relative(piece.location.root, piece.location.full),
              },
              enabled: true,
            });
          }
        }
      }
    });

    this.logger.info('Loading & caching databases...');
    void this._loadPolls();
    void this._loadCommandStats();
    void this._loadReactionRoles();

    this.logger.info('Loading addons from SkriptTools...');
    void this._loadSkriptToolsAddons();
    this.logger.info('Loading syntaxes from Skript-MC...');
    void this._loadSkriptMcSyntaxes();

    this.logger.info('Client initialization finished!');
  }

  public checkValidity(): void {
    if (!this.guild)
      return;

    // Check tokens.
    if (!process.env.SENTRY_TOKEN)
      this.logger.info('Disabling Sentry as the DSN was not set in the environment variables (SENTRY_TOKEN).');

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
      this.logger.error('Configured channels are invalid:');
      for (const error of invalidChannels)
        this.logger.info(error);
      if (process.env.NODE_ENV === 'production')
        throw new Error('Please fill correctly the configuration to start the bot.');
    }

    // Check roles IDs.
    for (const [key, value] of Object.entries(settings.roles)) {
      if (!value)
        this.logger.warn(`settings.roles.${key} is not set. You may want to fill this field to avoid any error.`);
      else if (!this.guild.roles.cache.has(value))
        this.logger.warn(`The id entered for settings.roles.${key} is not a valid role.`);
    }

    // TODO: Also check for emojis IDs.

    // Check client's server-level permissions.
    const requiredChannelPermissions = new Permissions([
      'ADD_REACTIONS',
      'ATTACH_FILES',
      'MANAGE_MESSAGES',
      'READ_MESSAGE_HISTORY',
      'SEND_MESSAGES',
      'USE_PUBLIC_THREADS',
      'VIEW_CHANNEL',
    ]);
    const requiredGuildPermissions = new Permissions([
      ...requiredChannelPermissions,
      'MANAGE_GUILD',
      'MANAGE_ROLES',
    ]);

    const guildMissingPerms = this.guild.me?.permissions.missing(requiredGuildPermissions);
    if (guildMissingPerms.length > 0)
      this.logger.warn(`Swan is missing Guild-Level permissions in guild "${this.guild.name}". Its cumulated roles' permissions does not contain: ${guildMissingPerms.join(', ')}.`);

    // Check client's channels permissions.
    for (const channel of channels.values()) {
      if (!channel.isText())
        continue;

      const channelMissingPerms = channel.permissionsFor(this.guild.me).missing(requiredChannelPermissions);
      if (channelMissingPerms.length > 0)
        this.logger.warn(`Swan is missing permissions ${channelMissingPerms.join(', ')} in channel "#${channel.name}"`);
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
    const commandIds = [...this.stores.get('commands').values()]
      .map(cmd => cmd.name);

    // FIXME: Chances are I'm doing something wrong here. This might be done in a more elegant way.
    const documents: Array<Query<CommandStatDocument | null, CommandStatDocument>> = [];
    for (const commandId of commandIds)
      documents.push(CommandStat.findOneAndUpdate({ commandId }, { commandId }, { upsert: true }));

    try {
      await Promise.all(documents);
    } catch (unknownError: unknown) {
      this.logger.error('Could not load some documents:');
      this.logger.error((unknownError as Error).stack);
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
      this.logger.error("Could not load SkriptTool's addons:");
      this.logger.error((unknownError as Error).stack);
    }
  }

  private async _loadSkriptMcSyntaxes(): Promise<void> {
    // Load all syntaxes from Skript-MC's API.
    try {
      // TODO: Handle rate-limits. Currently set at 200 requests/hour, but with thoses 2 endpoints,
      // we consume 11 requests. See https://skript-mc.fr/api#quotas
      const token = `api_key=${process.env.SKRIPTMC_DOCUMENTATION_TOKEN}`;
      const allSyntaxes: SkriptMcDocumentationSyntaxResponse[] = await axios(`${settings.apis.skriptmc}/documentation/syntaxes?${token}`)
        .then(res => res?.data);
      const allAddons: SkriptMcDocumentationFullAddonResponse[] = await axios(`${settings.apis.skriptmc}/documentation/addons?${token}`)
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
      this.logger.error("Could not fetch Skript-MC's addons/syntaxes:");
      this.logger.error((unknownError as Error).stack);
    }
  }
}
