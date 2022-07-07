import SwanListener from '@/app/structures/SwanListener';

export default class WarnListener extends SwanListener {
  public override run(info: string): void {
    this.container.logger.warn(`Discord.js emitted a warning: ${info}`);
  }
}
