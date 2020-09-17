import { Listener } from 'discord-akairo';
import settings from '../../../config/settings';

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
    this.client.logger.success('Swan is ready to listen for messages.');
  }
}

export default ReadyListener;
