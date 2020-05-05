import Command from '../../structures/Command';
import { config, commands } from '../../main';
import Help from './help';

class Discover extends Command {
  constructor() {
    super('Discover');
    this.aliases = ['discover', 'découvrir', 'decouvrir'];
    this.usage = 'discover';
    this.examples = ['discover'];
  }

  async execute(message, _args) {
    let result;
    while (!result) {
      const command = commands[Math.floor(Math.random() * commands.length)];
      // Les gérants ont toutes les permissions
      if (message.member.roles.cache.has(config.roles.owner)) result = command;
      // Check des permissions
      if (command.permissions.length === 0) result = command;
      for (const perm of command.permissions) {
        if (message.member.roles.cache.find(role => role.name === perm)) result = command;
      }
    }
    new Help().sendDetails(message, result);
  }
}

export default Discover;
