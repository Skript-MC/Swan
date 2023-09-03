import type { ContextMenuCommandDeniedPayload, Events, UserError } from '@sapphire/framework';
import { Listener, PreconditionError } from '@sapphire/framework';
import * as messages from '@/conf/messages';

export class ContextMenuCommandDenied extends Listener<typeof Events.ContextMenuCommandDenied> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async run(error: UserError & { context: any }, payload: ContextMenuCommandDeniedPayload): Promise<void> {
    if (error.context?.silent)
      return;

    if (error instanceof PreconditionError) {
      const errorKey = Object.keys(messages.errors.precondition).includes(error.identifier)
        ? error.identifier as keyof typeof messages.errors.precondition
        : 'unknownError';

      const content = messages.errors.precondition[errorKey];
      if (typeof content === 'string')
        await payload.interaction.reply({ content, ephemeral: true });
    }
  }
}
