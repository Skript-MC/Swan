import type { PreconditionResult } from '@sapphire/framework';
import { Precondition } from '@sapphire/framework';

export default class NotLoadingPrecondition extends Precondition {
  public override run(): PreconditionResult {
    return this.container.client.isLoading
      ? this.error({ identifier: 'preconditionNotLoading', message: 'Bot is still loading' })
      : this.ok();
  }
}
