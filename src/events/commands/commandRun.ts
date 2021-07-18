import { Event } from '@sapphire/framework';
import type { Message } from 'discord.js';
import CommandStat from '@/app/models/commandStat';
import type SwanCommand from '@/app/structures/commands/SwanCommand';

export default class CommandRunEvent extends Event {
  public override async run(message: Message, command: SwanCommand): Promise<void> {
    try {
      await CommandStat.findOneAndUpdate({ commandId: command.name }, { $inc: { uses: 1 } });
    } catch (unknownError: unknown) {
      this.context.logger.error("An error occurred while updating command's stats!");
      this.context.logger.info(`Command: ${command.name}`);
      this.context.logger.info(`Message: ${message.url}`);
      this.context.logger.error((unknownError as Error).stack);
    }
  }
}
