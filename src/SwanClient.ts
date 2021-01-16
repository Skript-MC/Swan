import path from 'path';
import axios from 'axios';
import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import type { Category, Command } from 'discord-akairo';
import type { PermissionString } from 'discord.js';
import messages from '../config/messages';
import settings from '../config/settings';
import CommandStat from './models/commandStat';
import Logger from './structures/Logger';
import TaskHandler from './structures/TaskHandler';
import { getDuration } from './utils';

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
    this.currentlyBanning = [];
    this.currentlyUnbanning = [];

    Logger.info('Creating Command handler');
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

    Logger.info('Creating Inhibitor handler');
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: path.join(__dirname, 'inhibitors/'),
      automateCategories: true,
    });

    Logger.info('Creating Task handler');
    this.taskHandler = new TaskHandler(this, {
      directory: path.join(__dirname, 'tasks/'),
      automateCategories: true,
    });

    Logger.info('Creating Listener handler');
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
      process,
    });

    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();

    this.commandHandler.resolver.addType('duration', (_message, phrase): number | null => {
      if (!phrase)
        return null;

      if (['def', 'déf', 'definitif', 'définitif', 'perm', 'perma', 'permanent'].includes(phrase))
        return -1;
      try {
        return getDuration(phrase);
       } catch {
        return null;
       }
    });

    this.commandHandler.resolver.addType('finiteDuration', (_message, phrase): number | null => {
      if (!phrase)
        return null;

      try {
        return getDuration(phrase);
      } catch {
        return null;
      }
    });

    void this._loadCommandStats();
    Logger.info('Loading addons from SkriptTools');
    void this._loadAddons();

    Logger.info('Client initialization finished');
  }

  public checkValidity(): void {
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
    if (!this.guild.me.hasPermission(permissions))
      Logger.error(`Swan is missing Guild-Level permissions. Its cumulated roles' permissions does not contain one of the following: ${permissions.join(', ')}.`);

    // Check client's channels permissions
    for (const channel of channels.array()) {
      if (!channel.isText())
        continue;

      const channelPermissions = channel.permissionsFor(this.guild.me).toArray();
      if (!permissions.every(perm => channelPermissions.includes(perm)))
        Logger.warn(`Swan is missing permission(s) ${permissions.filter(perm => !channelPermissions.includes(perm)).join(', ')} in channel "#${channel.name}".`);
    }
  }

  private async _loadCommandStats(): Promise<void> {
    const commandIds: string[] = this.commandHandler.categories
      .array()
      .flatMap((category: Category<string, Command>) => category.array())
      .map((cmd: Command) => cmd.id);

    const documents = [];
    for (const commandId of commandIds)
      documents.push(CommandStat.findOneAndUpdate({ commandId }, { commandId }, { upsert: true }));

    try {
      await Promise.all(documents);
    } catch (unknownError: unknown) {
      Logger.error('Could not load some documents:');
      Logger.error((unknownError as Error).stack);
    }
  }

  private async _loadAddons(): Promise<void> {
    try {
      const allAddons = await axios(settings.apis.addons).then(res => res?.data?.data);
      if (!allAddons)
        return;

      for (const addon of Object.keys(allAddons)) {
        const versions = allAddons[addon];
        if (versions)
          this.addonsVersions.push(versions[versions.length - 1]);
      }
    } catch (unknownError: unknown) {
      Logger.error('Could not load some addons:');
      Logger.error((unknownError as Error).stack);
    }
  }
}

export default SwanClient;