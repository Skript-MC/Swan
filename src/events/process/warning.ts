import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { Event } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ emitter: process })
export default class WarningEvent extends Event {
  public override run(warning: { name: string; message: string; stack: string }): void {
    this.context.logger.warn(`Node.js Warning: ${warning.message}`);
  }
}
