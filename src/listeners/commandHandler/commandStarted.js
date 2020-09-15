import { Listener } from 'discord-akairo';
import CommandStat from '../../models/commandStat';

class CommandStartedListener extends Listener {
  constructor() {
    super('commandStarted', {
      emitter: 'commandHandler',
      event: 'commandStarted',
      category: 'commandHandler',
    });
  }

  async exec(message, command) {
    try {
      await CommandStat.findOneAndUpdate({ commandId: command.id }, { $inc: { uses: 1 } });
    } catch (err) {
      this.client.logger.error("An error occured while updating commands's stats!");
      this.client.logger.detail(`Command: ${command}`);
      this.client.logger.detail(`Message: ${message.url}`);
      this.client.logger.error(err.stack);
    }
  }
}

export default CommandStartedListener;
