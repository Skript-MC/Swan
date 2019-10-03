import Command from '../../components/Command';

class GhostPing extends Command {
  constructor() {
    super('Ghostping');
    this.aliases = ['ghostping'];
    this.usage = 'ghostping @mention';
    this.examples = ['ghostping @Vengelis_ le FISC'];
    this.permissions = ['Staff'];
  }

  async execute(message, _args) {
    if (typeof message.mentions === 'undefined') message.author.send(this.config.missingUserArgument);
    else message.delete();
  }
}

export default GhostPing;
