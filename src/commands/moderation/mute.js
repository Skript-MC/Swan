import Command from '../../helpers/Command';
import { modLog } from '../../helpers/Moderation';
import { discordError, discordSuccess } from '../../helpers/Messages';
import { config, db } from '../../main';
import { secondToDuration, toTimestamp } from '../../utils';

class Mute extends Command {
  constructor() {
    super('Mute');
    this.aliases = ['mute'];
    this.usage = 'mute <@mention | ID> <durée> [<raison>]';
    this.examples = ['mute @AlexLew 5j Une raison plus ou moins valable'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    if (!args[1]) return message.channel.send(discordError(this.config.missingTimeArgument, message));
    if (!args[2]) return message.channel.send(discordError(this.config.missingReasonArgument, message));
    if (victim.id === message.author.id) return message.channel.send(discordError(this.config.noSelfMute, message));
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(discordError(this.config.userTooPowerful, message));
    // Regarde dans la database si le joueur est mute :
    db.sanctions.find({ member: victim.id, sanction: 'mute' }, (err, results) => {
      if (err) console.error(err);

      if (results.length > 0) return message.channel.send(discordError(this.config.alreadyMuted.replace('%u', victim), message));

      const reason = args.splice(2).join(' ') || this.config.noReasonSpecified;
      const duration = toTimestamp(args[1]) === -1 ? -1 : toTimestamp(args[1]) / 1000;
      if (duration === -1 && args[1] !== 'def') return message.channel.send(discordError(this.config.invalidDuration, message));

      // Durée maximale des sanctions des modos forum : 2h
      if (message.member.roles.has(config.roles.forumMod) && (duration !== -1 || duration > 7200)) return message.channel.send(discordError(this.config.durationTooLong, message));

      const role = message.guild.roles.find(r => r.name === config.moderation.muteRole);
      try {
        victim.roles.add(role);
      } catch (e) {
        message.channel.send(discordError(this.config.cantAddRole, message));
        console.error(e);
      }

      const success = this.config.successfullyMuted
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason)
        .replace('%d', secondToDuration(duration));
      message.channel.send(discordSuccess(success, message));

      return modLog({
        log: true,
        sanction: 'mute',
        color: config.colors.mute,
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
