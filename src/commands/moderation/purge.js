/* eslint-disable no-param-reassign */
import Command from '../../structures/Command';
import { discordError } from '../../structures/messages';
import { config, client } from '../../main';

class Purge extends Command {
  constructor() {
    super('Purge');
    this.aliases = ['purge'];
    this.usage = 'purge [<@mention>]';
    this.examples = ['purge @utilisateur 20'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const user = message.mentions.users.first();
    let amount = parseInt(args[0], 10) ? parseInt(args[0], 10) + 1 : parseInt(args[1], 10) + 1;

    if (!amount) return message.channel.send(discordError(this.config.missingNumberArgument, message));
    if (!amount && !user) return message.channel.send(discordError(this.config.wrongUsage, message));
    if (amount > config.moderation.purgeLimit) amount = config.moderation.purgeLimit;

    let messages = await message.channel.messages.fetch({ limit: amount }).catch(console.error);
    if (user) {
      messages = messages.filter(m => m.author.id === (user ? user.id : client.user.id)).array().slice(0, amount);
    }
    message.channel.bulkDelete(messages).catch((err) => {
      if (err.message.includes('14 days old')) message.channel.send(discordError(this.config.tooOld, message));
      else console.error(err);
    });
  }
}

export default Purge;
