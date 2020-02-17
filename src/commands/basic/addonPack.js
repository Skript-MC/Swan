import Command from '../../helpers/Command';

class AddonPack extends Command {
  constructor() {
    super('Addon Pack');
    this.aliases = ['addonpack', 'addon_pack', 'addon-pack'];
    this.usage = 'addon-pack <votre version de serveur>';
    this.examples = ['addon-pack 1.14'];
  }

  async execute(message, args) {
    if (args.length > 0) {
      // De la 1.9 à la 1.15 inclus
      const match = /1\.(9|1[0-5])(\.\d*)?/gimu.exec(args[0]);
      try {
        message.channel.send(this.config.messages[match[1] - 8]);
      } catch (e) {
        message.channel.send(this.config.invalidVersion);
      }
    } else {
      message.channel.send(this.config.invalidVersion);
    }
  }
}

export default AddonPack;
