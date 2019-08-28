import Command from '../../components/Command';
import { discordError, discordSuccess } from '../../components/Messages';
import { modLog } from '../../components/Moderation';

class Warn extends Command {
  constructor() {
    super('Warn');
    this.regex = /warn/gimu;
    this.usage = 'warn <@mention | ID> <raison>';
    this.examples.push('warn @polymeth Langage incorrect');
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return discordError(this.config.missingUserArgument, message);
    if (!args[1]) return discordError(this.config.missingReasonArgument, message);
    if (victim.id === message.author.id) return discordError(this.config.noSelfWarn, message);
    if (victim.highestRole.position >= message.member.highestRole.position) return discordError(this.config.userTooPowerful, message);
    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    const success = this.config.successfullyWarned
      .replace('%u', `${victim.user.username}`)
      .replace('%r', reason);
    discordSuccess(success, message);

    victim.send(this.config.warning.replace('%u', `${victim.user.username}`).replace('%r', reason));

    modLog({
      log: false,
      sanction: 'avertissement',
      color: '#fce21c',
      member: victim,
      mod: message.author,
      reason,
    }, message.guild);
  }
}

export default Warn;
