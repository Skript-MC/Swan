import Command from '../../structures/Command';
import Moderation from '../../structures/Moderation';
import SanctionManager from '../../structures/SanctionManager';

class Warn extends Command {
  constructor() {
    super('Warn');
    this.aliases = ['warn'];
    this.usage = 'warn <@mention | ID> [<raison>]';
    this.examples = ['warn @polymeth Langage incorrect'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = SanctionManager.getMember(message, args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);
    if (victim.id === message.author.id) return message.channel.sendError(this.config.noSelfWarn, message.member);
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.userTooPowerful, message.member);

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    Moderation.warn(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default Warn;
