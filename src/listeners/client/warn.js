import { Listener } from 'discord-akairo';

class WarnListener extends Listener {
  constructor() {
    super('warn', {
      event: 'warn',
      emitter: 'client',
    });
  }

  exec(info) {
    this.client.logger.warn(`DiscordJS emitted a warning: ${info}`);
  }
}

export default WarnListener;
