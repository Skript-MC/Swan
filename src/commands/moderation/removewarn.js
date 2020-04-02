import Command from '../../structures/Command';
import { discordError } from '../../structures/messages';
import Moderation from '../../structures/Moderation';
import SanctionManager from '../../structures/SanctionManager';

class RemoveWarn extends Command {
  constructor() {
    super('Remove Warn');
    this.aliases = ['removewarn', 'remwarn', 'deletewarn', 'delwarn', 'unwarn'];
    this.usage = 'removewarn <@mention | ID utilisateur> <ID warn> [<raison>]';
    this.examples = ['removewarn @polymeth 1585832207807 En fait trkl il m\'a payé'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = SanctionManager.getMember(message, args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));

    const id = args[1];
    if (!id) return message.channel.send(discordError(this.config.missingIdArgument, message));

    const reason = args.splice(2).join(' ') || this.config.noReasonSpecified;

    Moderation.removeWarn(victim, id, reason, message.author, this.config, message, message.guild);
  }
}

export default RemoveWarn;
