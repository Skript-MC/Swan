import { Inhibitor } from 'discord-akairo';
import type { Command } from 'discord-akairo';
import type { Message } from 'discord.js';

class PreventDuringLoadingInhibitor extends Inhibitor {
  constructor() {
    super('preventDuringLoading', {
      reason: 'preventDuringLoading',
    });
  }

  public exec(_message: Message, _command: Command): boolean {
    return this.client.isLoading;
  }
}

export default PreventDuringLoadingInhibitor;
