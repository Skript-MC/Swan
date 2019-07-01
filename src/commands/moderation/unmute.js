/* eslint-disable no-underscore-dangle */
import Command from '../../components/Command';
import { discordError, discordSuccess } from '../../components/Messages';
import { database } from '../../main';
import { removeSanction } from '../../components/Moderation';

class Unmute extends Command {
  constructor() {
    super('Unmute');
    this.usage = 'unmute <@mention | ID> <raison>';
    this.examples.push('unmute @4rno G mété tronpé hé');
    this.permissions.push('Staff');
    this.regex = /unmute/gmui;
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return discordError(this.config.missingUserArgument, message);
    if (!args[1]) return discordError(this.config.missingReasonArgument, message);
    // Regarde dans la database si le joueur est mute :
    database.findOne({ member: victim.id, sanction: 'mute' }, (err, result) => {
      if (err) console.error(err);

      if (!result) return discordError(this.config.notMuted.replace('%u', victim), message);

      const reason = args.splice(1).join(' ') || 'Aucune raison spécifiée';

      const success = this.config.successfullyUnmuted
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason);
      discordSuccess(success, message);

      removeSanction({
        member: victim,
        title: 'Nouveau cas :',
        mod: message.author,
        sanction: 'mute',
        reason,
        id: result._id,
      }, message.guild);
    });
  }
}

export default Unmute;
