import type { CommandDeniedPayload, Events, UserError } from '@sapphire/framework';
import { Listener, PreconditionError } from '@sapphire/framework';
import messages from '@/conf/messages';

export default class CommandDeniedListener extends Listener<typeof Events.CommandDenied> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async run(error: UserError & { context: any }, payload: CommandDeniedPayload): Promise<void> {
    if (error.context?.silent)
      return;

    if (error instanceof PreconditionError) {
      const errorKey = Object.keys(messages.errors.precondition).includes(error.identifier)
        ? error.identifier as keyof typeof messages.errors.precondition
        : 'unknownError';
      console.log('DEBUG ~ file: commandDenied.ts ~ line 14 ~ run ~ errorKey', errorKey);

      const content = messages.errors.precondition[errorKey];
      console.log('DEBUG ~ file: commandDenied.ts ~ line 18 ~ run ~ content', content);
      if (typeof content === 'string')
        await payload.message.channel.send(content);
    }
  }
}
