import Command from '../../structures/Command';
import { db } from '../../main';

class changeConfig extends Command {
  constructor() {
    super('changeConfig');
    this.aliases = ['changeconfig'];
    this.usage = 'changeconfig <configuration> <valeur>';
    this.examples = ['changeconfig ssh Admin123'];
    this.enabledInHelpChannels = false;
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    // Delete the message.
    message.delete();
    // Check if the targeted config is correct.
    if (!['sshpassword', 'joinpercentage'].includes(args[0])) return message.channel.sendError(this.config.invalidConfig, message.member);
    // Check if the new value is set.
    if (!args[1]) return message.channel.sendError(this.config.emptyValue, message.member);

    // Change the value in the database
    await db.miscellaneous.update(
      { entry: args[0] },
      { $set: { value: args.join('').slice(args[0].length) } },
      { multi: false, upsert: true },
    ).catch(console.error);
    // Send a success message
    message.channel.sendSuccess(this.config.successfullyChanged, message.member);
  }
}

export default changeConfig;
