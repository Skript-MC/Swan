/* eslint-disable no-underscore-dangle */
import Command from '../../components/Command';
import { removeSanction } from '../../components/Moderation';
import { discordError, discordSuccess } from '../../components/Messages';
import { db, config } from '../../main';

class Unban extends Command {
  constructor() {
    super('Unban');
    this.regex = /unban/gimu;
    this.usage = 'unban <@mention | ID> [-no-delete] [raison]';
    this.examples.push("unban @Acenox Oups je voulais ban qqun d'autre");
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return discordError(this.config.missingUserArgument, message);
    // Regarde dans la database si le joueur est ban :
    db.sanctions.findOne({ member: victim.id, sanction: 'ban' }, async (err, result) => {
      if (err) console.error(err);

      if (!result) return discordError(this.config.notBanned.replace('%u', victim), message);
      if (!message.member.roles.has(config.roles.owner) && result.modid !== message.author.id) return discordError(this.config.notYou, message);

      const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;
      if (reason.includes('-no-delete')) {
        reason.replace('-no-delete', '');
      } else {
        const name = `${config.moderation.banChannelPrefix}${victim.user.username.replace(/[^a-zA-Z0-9]/gimu, '').toLowerCase()}`;
        const chan = message.guild.channels.find(c => c.name === name && c.type === 'text');
        if (chan) chan.delete();
        else console.warning(`Une erreur est survenue en voulant supprimer le channel privé ${name}`);
      }

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
