import type { AkairoClient } from 'discord-akairo';
import messages from '../../config/messages';
import Logger from '../structures/Logger';
import type { GuildTextBasedChannel } from '../types';
import { noop } from '../utils';
import ModerationError from './ModerationError';

class ErrorState {
  client: AkairoClient;
  channel: GuildTextBasedChannel;
  errors: ModerationError[];

  constructor(client: AkairoClient, channel: GuildTextBasedChannel) {
    this.client = client;
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
      Logger.error(error.message);
      if (error instanceof ModerationError) {
        for (const [detail, value] of error.details.entries())
          Logger.detail(`${detail}: ${value}`);
      }
      Logger.detail(error.stack, true);
    }
  }
}

export default ErrorState;
