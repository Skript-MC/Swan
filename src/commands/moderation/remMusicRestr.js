import Command from '../../components/Command';
import { discordError, discordSuccess } from '../../components/Messages';
import { db } from '../../main';
import { removeSanction } from '../../components/Moderation';
import MusicBot from '../../music';

class RemoveMusicRestriction extends Command {
  constructor() {
    super('Remove Music Restriction');
    this.aliases = ['removemusicrestriction', 'remove-music-restriction', 'remove_music_restriction', 'remmusicrestr', 'rem-music-restr', 'rem_music_restr'];
    this.usage = 'removemusicrestriction <@mention | ID> [<raison>]';
    this.examples = ['removemusicrestr @4rno En fait c\'est une bonne musique'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!victim) return message.channel.send(discordError(this.config.missingUserArgument, message));
    // Regarde dans la database si le joueur est mute :
    db.sanctions.findOne({ member: victim.id, sanction: 'music_restriction' }, (err, result) => {
      if (err) console.error(err);

      if (!result) return message.channel.send(discordError(this.config.notRestricted.replace('%u', victim), message));

      const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

      const success = this.config.successfullyRemoveRestr
        .replace('%u', `${victim.user.username}`)
        .replace('%r', reason);
      message.channel.send(discordSuccess(success, message));

      const index = MusicBot.restricted.indexOf(victim.id);
      MusicBot.restricted.splice(index, 1);
      removeSanction({
        member: victim,
        title: 'Nouveau cas :',
        mod: message.author,
        sanction: 'music_restriction',
        reason,
        id: result._id,
      }, message.guild);
    });
  }
}

export default RemoveMusicRestriction;
