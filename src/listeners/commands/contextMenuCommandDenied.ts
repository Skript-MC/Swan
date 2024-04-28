import type {
  ContextMenuCommandContext,
  ContextMenuCommandDeniedPayload,
  Events,
  UserError,
} from '@sapphire/framework';
import { Listener, PreconditionError } from '@sapphire/framework';
import * as messages from '#config/messages';

export class ContextMenuCommandDeniedListener extends Listener<
  typeof Events.ContextMenuCommandDenied
> {
  public async run(
    error: UserError & { context: ContextMenuCommandContext },
    payload: ContextMenuCommandDeniedPayload,
  ): Promise<void> {
    if (error.context?.silent) return;

    if (!(error instanceof PreconditionError)) return;

    const errorKey = Object.keys(messages.errors.precondition).includes(
      error.identifier,
    )
      ? (error.identifier as keyof typeof messages.errors.precondition)
      : 'unknownError';

    const content = messages.errors.precondition[errorKey];
    if (typeof content === 'string')
      await payload.interaction.reply({ content, ephemeral: true });
  }
}
