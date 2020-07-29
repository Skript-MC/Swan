import Command from '../../structures/Command';
import { toTimestamp } from '../../utils';
import ACTION_TYPE from '../../structures/actions/actionType';
import MuteAction from '../../structures/actions/MuteAction';
import ModerationData from '../../structures/ModerationData';

class Mute extends Command {
  constructor() {
    super('Mute');
    this.aliases = ['mute'];
    this.usage = 'mute <@mention | ID> <durée> <raison>';
    this.examples = ['mute @Olyno 5j Une raison plus ou moins valable'];
    this.permissions = ['Staff'];
  }

  async execute(client, message, args) {
    const victim = message.mentions.members.first() || message.guild.members.resolve(args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);
    if (!args[1]) return message.channel.sendError(this.config.missingTimeArgument, message.member);
    if (!args[2]) return message.channel.sendError(this.config.missingReasonArgument, message.member);
    if (victim.id === message.author.id) return message.channel.sendError(this.config.noSelfMute, message.member);
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.userTooPowerful, message.member);

    const reason = args.splice(2).join(' ');
    let duration;
    if (['def', 'déf', 'definitif', 'définitif', 'perm', 'perma', 'permanent'].includes(args[1])) {
      duration = -1;
    } else {
      duration = toTimestamp(args[1]);
      if (!duration) return message.channel.sendError(this.config.invalidDuration, message.member);
      duration *= 1000;
    }

    // Durée max des modérateurs forum : 2j
    const roleToLow = message.member.roles.highest.id === client.config.roles.forumMod;
    if (roleToLow && duration > client.config.moderation.maxForumModDuration) {
      return message.channel.sendError(this.config.durationTooLong, message.member);
    }

    const data = new ModerationData()
      .setType(ACTION_TYPE.MUTE)
      .setColor(client.config.colors.mute)
      .setReason(reason)
      .setDuration(duration)
      .setModerator(message.member)
      .setMessageChannel(message.channel)
      .setFinishTimestamp();
    await data.setVictimId(victim.id);

    new MuteAction(data).commit();
  }
}

export default Mute;
