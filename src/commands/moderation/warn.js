import Command from '../../components/Command';
import { discordError, discordSuccess } from '../../components/Messages';
import { modLog } from '../../components/Moderation';
import { config } from '../../main';

class Warn extends Command {
  constructor() {
    super('Warn');
    this.aliases = ['warn'];
    this.usage = 'warn <@mention | ID> [<raison>]';
    this.examples = ['warn @polymeth Langage incorrect'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    if (victim.id === message.author.id) return message.channel.send(discordError(this.config.noSelfWarn, message));
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(discordError(this.config.userTooPowerful, message));
    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    const success = this.config.successfullyWarned
      .replace('%u', `${victim.user.username}`)
      .replace('%r', reason);
    message.channel.send(discordSuccess(success, message));

    victim.send(this.config.warning.replace('%u', `${victim.user.username}`).replace('%r', reason));

    modLog({
      log: false,
      sanction: 'avertissement',
      color: config.colors.warn,
      member: victim,
      mod: message.author,
      reason,
    }, message.guild);
  }
}

export default Warn;
