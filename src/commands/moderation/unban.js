import Command from '../../structures/Command';
import { discordError } from '../../structures/messages';
import Moderation from '../../structures/Moderation';
import SanctionManager from '../../structures/SanctionManager';

class Unban extends Command {
  constructor() {
    super('Unban');
    this.aliases = ['unban'];
    this.usage = 'unban <@mention | ID> [<raison>]';
    this.examples = ["unban @Acenox Oups je voulais ban qqun d'autre"];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = SanctionManager.getMember(message, args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    Moderation.unban(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default Unban;
