import Command from '../../structures/Command';

class Purge extends Command {
  constructor() {
    super('Purge');
    this.aliases = ['purge'];
    this.usage = 'purge [<@mention | ID>] <nombre> [<-f>]';
    this.examples = ['purge 40', 'purge 20 -f', 'purge @utilisateur 20'];
    this.permissions = ['Staff'];
  }

  async execute(client, message, args) {
    const user = message.mentions.members.first() || message.guild.members.resolve(args[0]);
    const force = args.includes('-f');
    let amount = parseInt(args[0], 10) ? parseInt(args[0], 10) + 1 : parseInt(args[1], 10) + 1;

    if (!amount) return message.channel.sendError(this.config.missingNumberArgument, message.member);
    if (!amount && !user) return message.channel.sendError(this.config.wrongUsage, message.member);
    if (amount > client.config.moderation.purgeLimit) amount = client.config.moderation.purgeLimit;

    let messages = await message.channel.messages.fetch({ limit: amount }).catch(console.error);
    if (user) {
      messages = messages.filter(m => m.author.id === user.id);
    }
    if (!force) {
      messages = messages.filter(m => m.system || !m.member.roles.cache.has(client.config.roles.staff));
    }

    message.channel.bulkDelete(messages).catch((err) => {
      if (err.message.includes('14 days old')) message.channel.sendError(this.config.tooOld, message.member);
    });
    // On re-delete le message si jamais il n'a pas été supprimé à cause des filtres
    message.delete();
  }
}

export default Purge;
