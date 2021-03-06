import { Listener } from 'discord-akairo';
import type { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import CommandStat from '@/app/models/commandStat';
import Logger from '@/app/structures/Logger';

class CommandStartedListener extends Listener {
  constructor() {
    super('commandStarted', {
      event: 'commandStarted',
      emitter: 'commandHandler',
    });
  }

  public async exec(message: Message, command: Command): Promise<void> {
    try {
      await CommandStat.findOneAndUpdate({ commandId: command.id }, { $inc: { uses: 1 } });
    } catch (unknownError: unknown) {
      Logger.error("An error occurred while updating command's stats!");
      Logger.detail(`Command: ${command}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.error((unknownError as Error).stack);
    }
  }
}

export default CommandStartedListener;
