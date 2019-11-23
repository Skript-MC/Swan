import Command from '../../helpers/Command';
import { discordError, discordSuccess } from '../../helpers/Messages';
import { db } from '../../main';
import { removeSanction } from '../../helpers/Moderation';

class Unmute extends Command {
  constructor() {
    super('Unmute');
    this.aliases = ['unmute'];
    this.usage = 'unmute <@mention | ID> [<raison>]';
    this.examples = ['unmute @4rno G mété tronpé hé'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    // Regarde dans la database si le joueur est mute :
    db.sanctions.findOne({ member: victim.id, sanction: 'mute' }, (err, result) => {
      if (err) console.error(err);

      if (!result) return message.channel.send(discordError(this.config.notMuted.replace('%u', victim), message));
      if (result.modid !== message.author.id) return message.channel.send(discordError(this.config.notYou, message));

      const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

      const success = this.config.successfullyUnmuted
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason);
      message.channel.send(discordSuccess(success, message));

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
