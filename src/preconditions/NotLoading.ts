import type { PreconditionResult } from '@sapphire/framework';
import { Precondition } from '@sapphire/framework';

export default class NotLoadingPrecondition extends Precondition {
  public run(): PreconditionResult {
    return this.context.client.isLoading
      ? this.error({ identifier: 'preconditionNotLoading', message: 'Bot is still loading' })
      : this.ok();
  }
}
