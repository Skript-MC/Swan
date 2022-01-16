import type { CommandErrorPayload } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';

export default class CommandErrorListener extends Listener {
  public override async run(error: Error, { message, piece: command }: CommandErrorPayload): Promise<void> {
    await message.channel.send(messages.global.oops).catch(noop);
    this.container.logger.error('Oops, something went wrong with a command!');
    this.container.logger.info(`Command: ${command.name}`);
    this.container.logger.info(`Message: ${message.url}`);

    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.container.logger.error(error.stack);
  }
}
