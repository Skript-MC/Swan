import type { PreconditionResult } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';

export class NotLoadingPrecondition extends Precondition {
  public override contextMenuRun(): PreconditionResult {
    return this._check();
  }

  public override chatInputRun(): PreconditionResult {
    return this._check();
  }

  private _check(): PreconditionResult {
    return this.container.client.isLoading
      ? this.error({ identifier: Identifiers.PreconditionNotLoading, message: 'Bot is still loading' })
      : this.ok();
  }
}
