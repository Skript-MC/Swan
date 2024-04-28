import { container } from '@sapphire/pieces';
import * as messages from '#config/messages';
import { channels } from '#config/settings';
import { ModerationError } from '#moderation/ModerationError';

export class ErrorState {
  errors: ModerationError[] = [];

  public addError(error: ModerationError): void {
    this.errors.push(error);
  }

  public hasError(): boolean {
    return this.errors.length > 0;
  }

  public async log(): Promise<void> {
    if (!this.hasError()) return;

    const channel = await container.client.guild.channels.fetch(
      channels.sanctionLog,
    );
    if (channel?.isTextBased()) await channel.send(messages.global.oops);

    for (const error of this.errors) {
      container.logger.error(error.message);
      if (error instanceof ModerationError) {
        for (const [detail, value] of error.details.entries())
          container.logger.info(`${detail}: ${value}`);
      }
      container.logger.info(error.stack, true);
    }
  }
}
