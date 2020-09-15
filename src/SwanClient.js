import path from 'path';
import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import messages from '../config/messages';
import settings from '../config/settings';
import CommandStat from './models/commandStat';
import Logger from './structures/Logger';

class SwanClient extends AkairoClient {
  constructor() {
    super({}, {
      ws: {
        intents: [
          'GUILDS', // Access to channels, create some, pin messages etc etc
          'GUILD_MEMBERS', // Access to GuildMemberAdd and GuildMemberRemove events (requires enabling via the discord dev portal)
          'GUILD_BANS', // Access to GuildBanAdd and GuildBanRemove events
          'GUILD_VOICE_STATES', // Access to VoiceStateUpdate event
          'GUILD_PRESENCES', // Access to users' presence (for .userinfo)
          'GUILD_MESSAGES', // Access to Message, MessageDelete and MessageUpdate events
          'GUILD_MESSAGE_REACTIONS', // Access to MessageReactionAdd events
        ],
      },
    });

    this.logger = new Logger();

    this.logger.info('Creating Command handler');
    this.commandHandler = new CommandHandler(this, {
      directory: path.join(__dirname, 'commands/'),
      prefix: settings.bot.prefix,
      aliasReplacement: /-/g,
      automateCategories: true,
      fetchMembers: true,
      commandUtil: true,
      handleEdits: true,
      storeMessages: true,
      argumentDefaults: {
        prompt: {
          retries: 3,
          time: 60_000,
          cancelWord: messages.prompt.cancelWord,
          stopWord: messages.prompt.stopWord,
          modifyStart: (_, text) => text + messages.prompt.footer,
          modifyRetry: (_, text) => text + messages.prompt.footer,
          timeout: messages.prompt.timeout,
          ended: messages.prompt.ended,
          cancel: messages.prompt.canceled,
        },
      },
    });

    this.logger.info('Creating Inhibitor handler');
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: path.join(__dirname, 'inhibitors/'),
    });

    this.logger.info('Creating Listener handler');
    this.listenerHandler = new ListenerHandler(this, {
      directory: path.join(__dirname, 'listeners/'),
    });

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler,
    });

    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();

    this.loadDatabases();

    this.logger.info('Client initialization finished');
  }

  async loadDatabases() {
    const commandIds = this.commandHandler.categories
      .array()
      .flatMap(category => category.array())
      .map(cmd => cmd.id);
    const documents = [];
    for (const commandId of commandIds)
      documents.push(CommandStat.findOneAndUpdate({ commandId }, { commandId }, { upsert: true }));

    try {
      await Promise.all(documents);
    } catch (err) {
      this.logger.error('Could not load some documents:');
      this.logger.error(err.stack);
    }
  }
}

export default SwanClient;
