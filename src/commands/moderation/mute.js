import Command from '../../structures/Command';
import { toTimestamp } from '../../utils';
import Moderation from '../../structures/Moderation';
import SanctionManager from '../../structures/SanctionManager';

class Mute extends Command {
  constructor() {
    super('Mute');
    this.aliases = ['mute'];
    this.usage = 'mute <@mention | ID> <durée> [<raison>]';
    this.examples = ['mute @AlexLew 5j Une raison plus ou moins valable'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = SanctionManager.getMember(message, args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);
    if (!args[1]) return message.channel.sendError(this.config.missingTimeArgument, message.member);
    if (!args[2]) return message.channel.sendError(this.config.missingReasonArgument, message.member);
    if (victim.id === message.author.id) return message.channel.sendError(this.config.noSelfMute, message.member);
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.userTooPowerful, message.member);

    const reason = args.splice(2).join(' ') || this.config.noReasonSpecified;
    let duration;
    if (args[1] === 'def' || args[1] === 'definitif') {
      duration = -1;
    } else {
      duration = toTimestamp(args[1]);
      if (!duration) return message.channel.sendError(this.config.invalidDuration, message.member);
    }

    Moderation.mute(victim, reason, duration, message.author, this.config, message, message.guild);
  }
}

export default Mute;
