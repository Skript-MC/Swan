import Command from '../../components/Command';
import { modLog } from '../../components/Moderation';
import { discordError, discordSuccess } from '../../components/Messages';
import { config, database } from '../../main';
import { secondToDate } from '../../utils';

const durations = {
  '(\\d+)s(econde?s?)?': 1,
  '(\\d+)min(ute?)?': 60,
  '(\\d+)h((e|o)ure?s?)?': 3600,
  '(\\d+)(d(ay)?|j(our)?)s?': 86400,
  '(\\d+)mo(is|onths?)?': 2629800,
  'def(initi(f|ve))?': -1,
};

class Mute extends Command {
  constructor() {
    super('Mute');
    this.usage = 'mute <@mention | ID> <durée> <raison>';
    this.examples.push('mute @AlexLew 5d Une raison plus ou moins valable');
    this.regex = /mute/gmui;
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
    database.find({ member: victim.id, sanction: 'mute' }, (err, results) => {
      if (err) console.error(err);

      if (results.length > 0) return discordError(this.config.alreadyMuted.replace('%u', victim), message);

      let duration;
      for (const durationRegex of Object.keys(durations)) {
        const match = new RegExp(durationRegex, 'gimu').exec(args[1]);
        if (match) {
          duration = parseInt(args[1].replace(new RegExp(durationRegex, 'gimu'), '$1'), 10) * durations[durationRegex] || -1;
          break;
        }
      }

      const reason = args.splice(2).join(' ') || 'Aucune raison spécifiée';
      const role = message.guild.roles.find(r => r.name === config.moderation.muteRole);
      try {
        victim.addRole(role);
      } catch (e) {
        discordError("Impossible d'ajouter ce rôle à ce membre ! Soit le rôle n'est pas créé, soit je n'ai pas les permissions nécéssaires. Il se peut que le problème vienne d'autrepart, auquel cas vous pouvez vous réferrer à l'erreur, disponible dans la console.", message);
        console.error(e);
      }

      const success = this.config.successfullyMuted
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason)
        .replace('%d', secondToDate(duration));
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
