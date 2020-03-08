import Command from '../../structures/Command';
import { commands } from '../../main';
import Help from './help';

class Discover extends Command {
  constructor() {
    super('Discover');
    this.aliases = ['discover', 'découvrir', 'decouvrir'];
    this.usage = 'discover';
    this.examples = ['discover'];
  }

  async execute(message, _args) {
    new Help().sendDetails(message, commands[Math.floor(Math.random() * commands.length)]);
  }
}

export default Discover;
