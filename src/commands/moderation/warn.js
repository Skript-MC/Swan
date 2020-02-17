import Command from '../../helpers/Command';
import { discordError } from '../../helpers/messages';
import ModerationBot from '../../helpers/moderation';

class Warn extends Command {
  constructor() {
    super('Warn');
    this.aliases = ['warn'];
    this.usage = 'warn <@mention | ID> [<raison>]';
    this.examples = ['warn @polymeth Langage incorrect'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = ModerationBot.getMember(message, args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    if (victim.id === message.author.id) return message.channel.send(discordError(this.config.noSelfWarn, message));
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(discordError(this.config.userTooPowerful, message));

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    ModerationBot.warn(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default Warn;
