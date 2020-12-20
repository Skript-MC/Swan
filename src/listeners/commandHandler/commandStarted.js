import { Listener } from 'discord-akairo';
import CommandStat from '../../models/commandStat';
import Logger from '../../structures/Logger';

class CommandStartedListener extends Listener {
  constructor() {
    super('commandStarted', {
      event: 'commandStarted',
      emitter: 'commandHandler',
    });
  }

  async exec(message, command) {
    try {
      await CommandStat.findOneAndUpdate({ commandId: command.id }, { $inc: { uses: 1 } });
    } catch (err) {
      Logger.error("An error occured while updating commands's stats!");
      Logger.detail(`Command: ${command}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.error(err.stack);
    }
  }
}

export default CommandStartedListener;
