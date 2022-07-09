import type { ChatInputCommandErrorPayload, Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { captureException } from '@sentry/node';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';

export default class CommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
  public override async run(error: Error, { interaction }: ChatInputCommandErrorPayload): Promise<void> {
    captureException(error);
    await interaction.reply(messages.global.oops).catch(noop);
    captureException(error, {
      user: interaction.user,
      extra: {
        command: interaction.command.toJSON(),
        stacktrace: error.stack,
      },
    });
    this.container.logger.error('Oops, something went wrong with a command!');
    this.container.logger.info(`Command: ${interaction.commandName}`);
    this.container.logger.error(error.stack);
  }
}
