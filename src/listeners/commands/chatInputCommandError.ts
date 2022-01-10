import type { ChatInputCommandErrorPayload, Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';

export default class CommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
  public override async run(error: Error, { interaction }: ChatInputCommandErrorPayload): Promise<void> {
    await interaction.channel.send(messages.global.oops).catch(noop);
    this.container.logger.error('Oops, something went wrong with a command!');
    this.container.logger.info(`Command: ${interaction.commandName}`);
    // TODO this.container.logger.info(`Message: ${message.url}`);

    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.container.logger.error(error.stack);
  }
}
