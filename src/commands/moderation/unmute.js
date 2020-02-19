import Command from '../../helpers/Command';
import { discordError } from '../../helpers/messages';
import Moderation from '../../helpers/Moderation';

class Unmute extends Command {
  constructor() {
    super('Unmute');
    this.aliases = ['unmute'];
    this.usage = 'unmute <@mention | ID> [<raison>]';
    this.examples = ['unmute @4rno G mété tronpé hé'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    Moderation.unmute(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default Unmute;
