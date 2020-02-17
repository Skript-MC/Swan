import Command from '../../helpers/Command';
import { discordError } from '../../helpers/messages';
import ModerationBot from '../../helpers/moderation';

class Unban extends Command {
  constructor() {
    super('Unban');
    this.aliases = ['unban'];
    this.usage = 'unban <@mention | ID> [<raison>]';
    this.examples = ["unban @Acenox Oups je voulais ban qqun d'autre"];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = ModerationBot.getMember(message, args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    ModerationBot.unban(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default Unban;
