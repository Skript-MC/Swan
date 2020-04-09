import Command from '../../structures/Command';
import { discordError } from '../../structures/messages';
import { config } from '../../main';

class Purge extends Command {
  constructor() {
    super('Purge');
    this.aliases = ['purge'];
    this.usage = 'purge [<@mention>] <nombre> [<-f>]';
    this.examples = ['purge 40', 'purge 20 -f', 'purge @utilisateur 20'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const user = message.mentions.users.first();
    const force = args.includes('-f');
    let amount = parseInt(args[0], 10) ? parseInt(args[0], 10) + 1 : parseInt(args[1], 10) + 1;

    if (!amount) return message.channel.send(discordError(this.config.missingNumberArgument, message));
    if (!amount && !user) return message.channel.send(discordError(this.config.wrongUsage, message));
    if (amount > config.moderation.purgeLimit) amount = config.moderation.purgeLimit;

    let messages = await message.channel.messages.fetch({ limit: amount }).catch(console.error);
    if (user) {
      messages = messages.filter(m => m.author.id === user.id);
    }
    if (!force) {
      messages = messages.filter(m => !m.member.roles.cache.has(config.roles.staff));
    }

    message.channel.bulkDelete(messages).catch((err) => {
      if (err.message.includes('14 days old')) message.channel.send(discordError(this.config.tooOld, message));
    });
    // On re-delete le message si jamais il n'a pas été supprimé à cause des filtres
    message.delete();
  }
}

export default Purge;
