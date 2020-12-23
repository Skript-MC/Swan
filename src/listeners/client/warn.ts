import { Listener } from 'discord-akairo';
import Logger from '../../structures/Logger';

class WarnListener extends Listener {
  constructor() {
    super('warn', {
      event: 'warn',
      emitter: 'client',
    });
  }

  public exec(info: string): void {
    Logger.warn(`DiscordJS emitted a warning: ${info}`);
  }
}

export default WarnListener;
