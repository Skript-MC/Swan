import Command from '../../structures/Command';
import { db } from '../../main';

class SetSshPassword extends Command {
  constructor() {
    super('SetSshPassword');
    this.aliases = ['setssh', 'setsshpassword'];
    this.usage = 'setssh <mot de passe>';
    this.examples = ['setssh Admin123'];
    this.enabledInHelpChannels = false;
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.send(this.config.noPassword);

    message.delete();
    await db.miscellaneous.update(
      { entry: 'sshpassword' },
      { $set: { value: args.join('') } },
      { multi: false, upsert: true },
    ).catch(console.error);
    message.channel.send(this.config.successfullyChanged);
  }
}

export default SetSshPassword;
