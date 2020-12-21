import { Listener } from 'discord-akairo';
import settings from '../../../config/settings';
import Logger from '../../structures/Logger';

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      event: 'ready',
      emitter: 'client',
    });
  }

  exec() {
    this.client.guild = this.client.guilds.resolve(settings.bot.guild);
    this.client.checkValidity();

    this.client.taskHandler.loadAll();

    Logger.success('Swan is ready to listen for messages.');
  }
}

export default ReadyListener;
