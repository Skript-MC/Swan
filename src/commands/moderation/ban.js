import Command from '../../components/Command';
import { modLog } from '../../components/Moderation';
import { discordError, discordSuccess } from '../../components/Messages';
import { config, db } from '../../main';
import { secondToDuration, toTimestamp, prunePseudo } from '../../utils';

const chanPerms = (author, victim) => [{
  id: config.roles.everyone,
  deny: ['VIEW_CHANNEL'],
}, {
  id: config.roles.staff,
  deny: ['MANAGE_CHANNELS'],
  allow: ['VIEW_CHANNEL'],
}, {
  id: author.id,
  allow: ['MANAGE_CHANNELS'],
}, {
  id: victim.id,
  allow: ['VIEW_CHANNEL'],
}];

class Ban extends Command {
  constructor() {
    super('Ban');
    this.aliases = ['ban', 'sdb'];
    this.usage = 'ban <@mention | ID> <durée> [<raison>]';
    this.examples = ['ban @Uneo7 5j Mouahaha'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    const role = message.guild.roles.find(r => r.name === config.moderation.banRole);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    if (!args[1]) return message.channel.send(discordError(this.config.missingTimeArgument, message));
    if (!args[2]) return message.channel.send(discordError(this.config.missingReasonArgument, message));
    if (victim.id === message.author.id) return message.channel.send(discordError(this.config.unableToSelfBan, message));
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(discordError(this.config.userTooPowerful, message));
    // Regarde dans la database si le joueur est ban :
    db.sanctions.find({ member: victim.id, sanction: 'ban' }, async (err, results) => {
      if (err) console.error(err);

      const duration = toTimestamp(args[1]) === -1 ? -1 : toTimestamp(args[1]) / 1000;
      const reason = args.splice(2).join(' ') || this.config.noReasonSpecified;
      const pseudo = prunePseudo(victim);

      // Déjà un résultat dans la bdd
      if (results.length > 0) {
        return message.channel.send(discordError(this.config.alreadyBanned.replace('%u', victim), message));
      }
      // Durée invalide
      if (duration < 0 && args[1] !== 'def') {
        return message.channel.send(discordError(this.config.invalidDuration, message));
      }
      // Durée max des modérateurs forum : 2h
      if (message.member.roles.has(config.roles.forumMod) && (duration === -1 || duration > 7200)) {
        return message.channel.send(discordError(this.config.durationTooLong));
      }

      // Créer un channel perso
      let chan = message.guild.channels.find(c => c.name === `${config.moderation.banChannelPrefix}${pseudo}` && c.type === 'text');
      if (!chan) {
        try {
          chan = await message.guild.channels.create(`${config.moderation.banChannelPrefix}${pseudo}`, 'text');
          chan.setParent(config.moderation.log.categoryID);
          chan.setTopic(`Canal privé suite au bannissement de ${victim.user.username}, par ${message.author.username}`);
          await chan.overwritePermissions({
            permissionOverwrites: chanPerms(message.author, victim),
            reason: `Création du canal perso de ${victim.user.username}. (banni)`,
          });
        } catch (e) {
          console.error('Error while attempting to create the channel :');
          console.error(e);
        }
      }

      // Ajout du rôle "Sous-fiffre"
      try {
        victim.roles.add(role);
      } catch (e) {
        message.channel.send(discordError(this.config.cantAddRole, message));
        console.error(e);
      }

      // Envoie des messages
      const success = this.config.successfullyBanned
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason)
        .replace('%d', secondToDuration(duration));
      const whyHere = this.config.whyHere
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason)
        .replace('%d', secondToDuration(duration));

      message.channel.send(discordSuccess(success, message));
      chan.send(whyHere);

      // Log
      return modLog({
        log: true,
        sanction: 'ban',
        color: config.colors.ban,
        member: victim,
        mod: message.author,
        duration,
        finish: duration !== -1 ? Date.now() + duration * 1000 : -1,
        privateChannel: chan,
        reason,
      }, message.guild);
    });
  }
}

export default Ban;
