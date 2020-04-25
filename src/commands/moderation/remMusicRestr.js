import Command from '../../structures/Command';
import Moderation from '../../structures/Moderation';
import SanctionManager from '../../structures/SanctionManager';

class RemoveMusicRestriction extends Command {
  constructor() {
    super('Remove Music Restriction');
    this.aliases = ['removemusicrestriction', 'remove-music-restriction', 'remove_music_restriction', 'remmusicrestr', 'rem-music-restr', 'rem_music_restr'];
    this.usage = 'removemusicrestriction <@mention | ID> [<raison>]';
    this.examples = ['removemusicrestr @4rno En fait c\'est une bonne musique'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = SanctionManager.getMember(message, args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    Moderation.removeMusicRestriction(victim, reason, message.author, this.config, message, message.guild);
  }
}

export default RemoveMusicRestriction;
