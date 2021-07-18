import type { CommandErrorPayload } from '@sapphire/framework';
import { Event } from '@sapphire/framework';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';

export default class CommandErrorEvent extends Event {
  public override async run(error: Error, { message, piece: command }: CommandErrorPayload): Promise<void> {
    await message.channel.send(messages.global.oops).catch(noop);
    this.context.logger.error('Oops, something went wrong with a command!');
    this.context.logger.info(`Command: ${command.name}`);
    this.context.logger.info(`Message: ${message.url}`);

    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.context.logger.error(error.stack);
  }
}
