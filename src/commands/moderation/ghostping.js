import Command from '../../components/Command';

class GhostPing extends Command {
  constructor() {
    super('ghostping');
    this.regex = /ghostping/gmui;
    this.usage = 'ghostping @mention';
    this.examples.push('ghostping @Vengelis_ le FISC');
    this.permissions.push('Staff');
  }

  async execute(message, _args) {
    if (message.mentions === undefined) {
      message.author.send('Pour vous amuser avec le .ghostping, vous devez mentionner un utilisateur. Exemple: .ghostping @Gilbert de Riv#8680');
    } else {
      message.delete();
    }
  }
}

export default GhostPing;
