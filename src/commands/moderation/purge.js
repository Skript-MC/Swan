import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config, client } from '../../main';

class Purge extends Command {
  constructor() {
    super('Purge');
    this.regex = /purge/gmui;
    this.usage = 'purge [<@mention>]';
    this.examples.push('purge @utilisateur 20');
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    const user = message.mentions.users.first();
    let amount = parseInt(args[0], 10) ? parseInt(args[0], 10) + 1 : parseInt(args[1], 10) + 1;

    if (!amount) return discordError(this.config.missingNumberArgument, message);
    if (!amount && !user) return discordError(this.config.wrongUsage, message);
    if (amount > config.miscellaneous.purgeLimit) amount = config.miscellaneous.purgeLimit;

    message.channel.fetchMessages({
      limit: amount,
    }).then((messages) => {
      if (user) {
        const filterBy = user ? user.id : client.user.id;
        messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
      }
      message.channel.bulkDelete(messages).catch(err => console.error(err.message));
    });
  }
}

export default Purge;
