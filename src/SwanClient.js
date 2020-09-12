import path from 'path';
import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import messages from '../config/messages';
import settings from '../config/settings';

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

    this.commandHandler = new CommandHandler(this, {
      directory: path.join(__dirname, 'commands/'),
      prefix: settings.bot.prefix,
      aliasReplacement: /-/g,
      commandUtil: true,
      handleEdits: true,
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: path.join(__dirname, 'inhibitors/'),
    });

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

    this.messages = messages;
  }
}

export default SwanClient;
