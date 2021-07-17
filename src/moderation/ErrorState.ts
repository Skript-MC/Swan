import { Store } from '@sapphire/pieces';
import type { GuildTextBasedChannel } from '@/app/types';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';
import ModerationError from './ModerationError';

export default class ErrorState {
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
      Store.injectedContext.logger.error(error.message);
      if (error instanceof ModerationError) {
        for (const [detail, value] of error.details.entries())
        Store.injectedContext.logger.info(`${detail}: ${value}`);
      }
      Store.injectedContext.logger.info(error.stack, true);
    }
  }
}
