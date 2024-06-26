import type { ChatInputCommandContext, ChatInputCommandDeniedPayload, Events, UserError } from '@sapphire/framework';
import { Listener, PreconditionError } from '@sapphire/framework';
import * as messages from '#config/messages';

export class CommandDeniedListener extends Listener<typeof Events.ChatInputCommandDenied> {
  public async run(
    error: UserError & { context: ChatInputCommandContext },
    payload: ChatInputCommandDeniedPayload,
  ): Promise<void> {
    if (error.context?.silent) return;

    if (!(error instanceof PreconditionError)) return;

    const errorKey = Object.keys(messages.errors.precondition).includes(error.identifier)
      ? (error.identifier as keyof typeof messages.errors.precondition)
      : 'unknownError';

    const content = messages.errors.precondition[errorKey];
    if (typeof content === 'string') await payload.interaction.reply({ content, ephemeral: true });
  }
}
