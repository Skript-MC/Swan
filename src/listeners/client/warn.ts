import { Listener } from '@sapphire/framework';

export default class WarnListener extends Listener {
  public override run(info: string): void {
    this.container.logger.warn(`Discord.js emitted a warning: ${info}`);
  }
}
