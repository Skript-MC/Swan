/* eslint-disable no-underscore-dangle */
import Command from '../../components/Command';
import { removeSanction } from '../../components/Moderation';
import { discordError, discordSuccess } from '../../components/Messages';
import { sanctionDb, config } from '../../main';

class Unban extends Command {
  constructor() {
    super('Unban');
    this.regex = /unban/gimu;
    this.usage = 'unban <@mention | ID> [raison]';
    this.examples.push("unban @Acenox Oups je voulais ban qqun d'autre");
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return discordError(this.config.missingUserArgument, message);
    // Regarde dans la database si le joueur est ban :
    sanctionDb.findOne({ member: victim.id, sanction: 'ban' }, async (err, result) => {
      if (err) console.error(err);

      if (!result) return discordError(this.config.notBanned.replace('%u', victim), message);
      if (!message.member.roles.has('206452455507099650') && result.modid !== message.author.id) return discordError(this.config.notYou, message);

      const reason = args.splice(1).join(' ') || 'Aucune raison spécifiée';

      const chan = message.guild.channels.find(c => c.name === `${config.moderation.banChannelPrefix}${victim.user.username.replace(/[^a-zA-Z0-9]/gimu, '').toLowerCase()}` && c.type === 'text');
      if (chan) chan.delete();

      const success = this.config.successfullyUnbanned
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason);
      discordSuccess(success, message);

      removeSanction({
        member: victim,
        title: 'Nouveau cas :',
        mod: message.author,
        sanction: 'ban',
        reason,
        id: result._id,
      }, message.guild);
    });
  }
}

export default Unban;
