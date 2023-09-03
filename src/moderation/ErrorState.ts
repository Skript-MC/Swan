import { container } from '@sapphire/pieces';
import type { GuildTextBasedChannel } from 'discord.js';
import { ModerationError } from '@/app/moderation/ModerationError';
import { noop } from '@/app/utils';
import * as messages from '@/conf/messages';

export class ErrorState {
  channel: GuildTextBasedChannel;
  errors: ModerationError[];

  constructor(channel: GuildTextBasedChannel) {
    this.channel = channel;
    this.errors = [];
  }

  public addError(error: ModerationError): void {
    this.errors.push(error);
  }

  public hasError(): boolean {
    return this.errors.length > 0;
  }

  public log(): void {
    if (!this.hasError())
      return;

    void this.channel.send(messages.global.oops).catch(noop);
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
