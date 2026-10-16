import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ emitter: process })
export class WarningListener extends Listener {
  public override run(warning: { name: string; message: string; stack: string }): void {
    this.container.logger.warn(`Node.js Warning: ${warning.message}`);
  }
}
