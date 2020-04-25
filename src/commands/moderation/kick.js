import Command from '../../structures/Command';
import Moderation from '../../structures/Moderation';
import SanctionManager from '../../structures/SanctionManager';

class Kick extends Command {
  constructor() {
    super('Kick');
    this.aliases = ['kick'];
    this.usage = 'kick <@mention | ID> [<raison>]';
    this.examples = ['kick @WeeksyBDW C\'est pas bien !'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = SanctionManager.getMember(message, args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);
    if (victim.id === message.author.id) return message.channel.sendError(this.config.noSelfWarnKick, message.member);
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.userTooPowerful, message.member);

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    Moderation.kick(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default Kick;
