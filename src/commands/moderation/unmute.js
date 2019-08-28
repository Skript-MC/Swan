/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import Command from '../../components/Command';
import { discordError, discordSuccess } from '../../components/Messages';
import { db } from '../../main';
import { removeSanction } from '../../components/Moderation';

class Unmute extends Command {
  constructor() {
    super('Unmute');
    this.regex = /unmute/gimu;
    this.usage = 'unmute <@mention | ID> <raison>';
    this.examples.push('unmute @4rno G mété tronpé hé');
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return discordError(this.config.missingUserArgument, message);
    if (!args[1]) return discordError(this.config.missingReasonArgument, message);
    // Regarde dans la database si le joueur est mute :
    db.sanctions.findOne({ member: victim.id, sanction: 'mute' }, (err, result) => {
      if (err) console.error(err);

      if (!result) return discordError(this.config.notMuted.replace('%u', victim), message);
      if (result.modid !== message.author.id) return discordError(this.config.notYou, message);

      const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

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
