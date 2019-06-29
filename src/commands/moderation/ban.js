import Command from '../../components/Command';
import { modLog } from '../../components/Log';
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

class Ban extends Command {
  constructor() {
    super('Ban');
    this.usage = 'ban <@mention | ID> <durée> <raison>';
    this.examples.push('ban @AlexLew 5d Une raison valable... ou non');
    this.permissions.push('Staff');
    this.regex = /ban/gmui;
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
    database.find({ member: victim.id, sanction: 'ban' }, async (err, results) => {
      if (err) console.error(err);

      if (results.length > 0) return discordError(this.config.alreadyBanned.replace('%u', victim), message);

      const reason = args.splice(2).join(' ') || 'Aucune raison spécifiée';

      let duration;
      for (const durationRegex of Object.keys(durations)) {
        const match = new RegExp(durationRegex, 'gimu').exec(args[1]);
        if (match) {
          duration = parseInt(args[1].replace(new RegExp(durationRegex, 'gimu'), '$1'), 10) * durations[durationRegex] || -1;
          break;
        }
      }

      // Créer un channel perso
      let chan = message.guild.channels.find(c => c.name === `${config.moderation.banChannelPrefix}${victim.user.username.replace(/[^a-zA-Z]/gimu, '').toLowerCase()}` && c.type === 'text');
      if (!chan) {
        try {
          chan = await message.guild.createChannel(`${config.moderation.banChannelPrefix}${victim.user.username.replace(/[^a-zA-Z]/gimu, '').toLowerCase()}`, 'text');
          chan.setParent(config.moderation.log.categoryID);
          await chan.overwritePermissions(message.guild.roles.find(r => r.name === '@everyone'), { VIEW_CHANNEL: false });
          await chan.overwritePermissions(message.guild.roles.find(r => r.name === 'Staff'), { VIEW_CHANNEL: true });
          await chan.overwritePermissions(victim, { VIEW_CHANNEL: true });
        } catch (e) {
          console.error('Error while attempting to create the channel :');
          console.error(e);
        }
      }

      try {
        victim.addRole(role);
      } catch (e) {
        discordError("Impossible d'ajouter le rôle à ce membre !", message);
        console.error(e);
      }

      const success = this.config.successfullyBanned
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason)
        .replace('%d', secondToDate(duration));

      discordSuccess(success, message);
      chan.send(this.config.whyHere.replace('%u', `${victim.user.username}`));

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
