import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class WarningListener extends Listener {
  constructor() {
    super('warning', {
      event: 'warning',
      emitter: 'process',
    });
  }

  public exec(warning: { name: string; message: string; stack: string }): void {
    Logger.warn(`Node.js Warning: ${warning.message}`);
  }
}

export default WarningListener;
