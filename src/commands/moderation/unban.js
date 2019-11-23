import Command from '../../helpers/Command';
import { removeSanction } from '../../helpers/Moderation';
import { discordError, discordSuccess } from '../../helpers/Messages';
import { db, config } from '../../main';
import { prunePseudo } from '../../utils';

class Unban extends Command {
  constructor() {
    super('Unban');
    this.aliases = ['unban'];
    this.usage = 'unban <@mention | ID> [-no-delete] [<raison>]';
    this.examples = ["unban @Acenox Oups je voulais ban qqun d'autre"];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    // Regarde dans la database si le joueur est ban :
    db.sanctions.findOne({ member: victim.id, sanction: 'ban' }, async (err, result) => {
      if (err) console.error(err);

      if (!result) return message.channel.send(discordError(this.config.notBanned.replace('%u', victim), message));
      if (!message.member.roles.has(config.roles.owner) && result.modid !== message.author.id) return message.channel.send(discordError(this.config.notYou, message));

      const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;
      if (reason.includes('-no-delete')) {
        reason.replace('-no-delete', '');
      } else {
        const name = `${config.moderation.banChannelPrefix}${prunePseudo(victim)}`;
        const chan = message.guild.channels.find(c => c.name === name && c.type === 'text');
        if (chan) chan.delete();
        else console.warning(`Une erreur est survenue en voulant supprimer le channel privé ${name}`);
      }

      const success = this.config.successfullyUnbanned
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason);
      message.channel.send(discordSuccess(success, message));

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
