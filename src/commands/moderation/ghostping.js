import Command from '../../components/Command';

class GhostPing extends Command {
  constructor() {
    super('ghostping');
    this.regex = /ghostping/gimu;
    this.usage = 'ghostping @mention';
    this.examples.push('ghostping @Vengelis_ le FISC');
    this.permissions.push('Staff');
  }

  async execute(message, _args) {
    if (message.mentions === undefined) {
      message.author.send(this.config.missingUserArgument);
    } else {
      message.delete();
    }
  }
}

export default GhostPing;
