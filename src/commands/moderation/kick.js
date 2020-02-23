import Command from '../../structures/Command';
import { discordError } from '../../structures/messages';
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
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    if (victim.id === message.author.id) return message.channel.send(discordError(this.config.noSelfWarnKick, message));
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(discordError(this.config.userTooPowerful, message));

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    Moderation.kick(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default Kick;
