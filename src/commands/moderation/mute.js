/* eslint-disable no-bitwise */
/* eslint-disable consistent-return */
import Command from '../../components/Command';
import { modLog } from '../../components/Moderation';
import { discordError, discordSuccess } from '../../components/Messages';
import { config, sanctionDb } from '../../main';
import { secondToDuration, toTimestamp } from '../../utils';

class Mute extends Command {
  constructor() {
    super('Mute');
    this.regex = /mute/gimu;
    this.usage = 'mute <@mention | ID> <durée> <raison>';
    this.examples.push('mute @AlexLew 5d Une raison plus ou moins valable');
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return discordError(this.config.missingUserArgument, message);
    if (!args[1]) return discordError(this.config.missingTimeArgument, message);
    if (!args[2]) return discordError(this.config.missingReasonArgument, message);
    if (victim.id === message.author.id) return discordError(this.config.noSelfMute, message);
    if (victim.highestRole.position >= message.member.highestRole.position) return discordError(this.config.userTooPowerful, message);
    // Regarde dans la database si le joueur est mute :
    sanctionDb.find({ member: victim.id, sanction: 'mute' }, (err, results) => {
      if (err) console.error(err);

      if (results.length > 0) return discordError(this.config.alreadyMuted.replace('%u', victim), message);

      const reason = args.splice(2).join(' ') || 'Aucune raison spécifiée';
      const duration = toTimestamp(args[1]) === -1 ? -1 : toTimestamp(args[1]) / 1000;
      if (duration === -1 && args[1] !== 'def') return discordError(this.config.invalidDuration, message);

      // Durée maximale des sanctions des modos forum : 2h
      if (message.member.roles.has('274282181537431552') && (!~duration || duration > 7200)) return discordError(this.config.durationTooLong, message);

      const role = message.guild.roles.find(r => r.name === config.moderation.muteRole);
      try {
        victim.addRole(role);
      } catch (e) {
        discordError("Impossible d'ajouter ce rôle à ce membre ! Soit le rôle n'est pas créé, soit je n'ai pas les permissions nécessaires. Il se peut que le problème vienne d'autre part, auquel cas vous pouvez vous réferrer à l'erreur, disponible dans la console.", message);
        console.error(e);
      }

      const success = this.config.successfullyMuted
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason)
        .replace('%d', secondToDuration(duration));
      discordSuccess(success, message);

      return modLog({
        log: true,
        sanction: 'mute',
        color: '#ff6b61',
        member: victim,
        mod: message.author,
        duration,
        finish: duration !== -1 ? Date.now() + duration * 1000 : -1,
        reason,
      }, message.guild);
    });
  }
}

export default Mute;
