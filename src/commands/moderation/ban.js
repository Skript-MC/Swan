/* eslint-disable no-bitwise */
import Command from '../../components/Command';
import { modLog } from '../../components/Moderation';
import { discordError, discordSuccess } from '../../components/Messages';
import { config, db } from '../../main';
import { secondToDuration, toTimestamp } from '../../utils';

class Ban extends Command {
  constructor() {
    super('Ban');
    this.regex = /ban/gimu;
    this.usage = 'ban <@mention | ID> <durée> <raison>';
    this.examples.push('ban @Uneo7 5j Mouahaha');
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    const role = message.guild.roles.find(r => r.name === config.moderation.banRole);
    if (!victim) return discordError(this.config.missingUserArgument, message);
    if (!args[1]) return discordError(this.config.missingTimeArgument, message);
    if (!args[2]) return discordError(this.config.missingReasonArgument, message);
    if (victim.id === message.author.id) return discordError(this.config.unableToSelfBan, message);
    if (victim.highestRole.position >= message.member.highestRole.position) return discordError(this.config.userTooPowerful, message);
    // Regarde dans la database si le joueur est ban :
    db.sanctions.find({ member: victim.id, sanction: 'ban' }, async (err, results) => {
      if (err) console.error(err);

      if (results.length > 0) return discordError(this.config.alreadyBanned.replace('%u', victim), message);

      const reason = args.splice(2).join(' ') || this.config.noReasonSpecified;
      const duration = toTimestamp(args[1]) === -1 ? -1 : toTimestamp(args[1]) / 1000;
      if (duration === -1 && args[1] !== 'def') return discordError(this.config.invalidDuration, message);

      // Durée maximale des sanctions des modos forum : 2h
      if (message.member.roles.has(config.roles.forumMod) && (duration === -1 || duration > 7200)) return discordError(this.config.durationTooLong);

      // Créer un channel perso
      let chan = message.guild.channels.find(c => c.name === `${config.moderation.banChannelPrefix}${victim.user.username.replace(/[^a-zA-Z0-9]/gimu, '').toLowerCase()}` && c.type === 'text');
      if (!chan) {
        try {
          chan = await message.guild.createChannel(`${config.moderation.banChannelPrefix}${victim.user.username.replace(/[^a-zA-Z0-9]/gimu, '').toLowerCase()}`, { type: 'text' });
          chan.setParent(config.moderation.log.categoryID);
          await chan.overwritePermissions(message.guild.roles.find(r => r.name === '@everyone'), { VIEW_CHANNEL: false });
          await chan.overwritePermissions(message.guild.roles.find(r => r.name === 'Staff'), { MANAGE_CHANNELS: false, VIEW_CHANNEL: true });
          await chan.overwritePermissions(message.author, { MANAGE_CHANNELS: true });
          await chan.overwritePermissions(victim, { VIEW_CHANNEL: true });
        } catch (e) {
          console.error('Error while attempting to create the channel :');
          console.error(e);
        }
      }

      try {
        victim.addRole(role);
      } catch (e) {
        discordError(this.config.cantAddRole, message);
        console.error(e);
      }

      const success = this.config.successfullyBanned
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason)
        .replace('%d', secondToDuration(duration));

      discordSuccess(success, message);
      chan.send(this.config.whyHere.replace('%u', `${victim.user.username}`).replace('%t', secondToDuration(duration)));

      return modLog({
        log: true,
        sanction: 'ban',
        color: '#cc3300',
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
