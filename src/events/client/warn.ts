import { Event } from '@sapphire/framework';

export default class WarnEvent extends Event {
  public override run(info: string): void {
    this.context.logger.warn(`Discord.js emitted a warning: ${info}`);
  }
}
