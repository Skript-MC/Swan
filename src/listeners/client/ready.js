import { Listener } from 'discord-akairo';

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      event: 'ready',
      emitter: 'client',
    });
  }

  exec() {
    this.client.logger.success('Swan is ready to listen for messages.');
  }
}

export default ReadyListener;
