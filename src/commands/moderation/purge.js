/* eslint-disable no-param-reassign */
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
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

    message.channel.messages.fetch({
      limit: amount,
    }).then((messages) => {
      if (user) {
        const filterBy = user ? user.id : client.user.id;
        messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
      }
      message.channel.bulkDelete(messages).catch(console.error);
    });
  }
}

export default Purge;
