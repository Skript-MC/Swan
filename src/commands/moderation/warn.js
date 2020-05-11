import Command from '../../structures/Command';
import { config } from '../../main';
import ACTION_TYPE from '../../structures/actions/actionType';
import ModerationData from '../../structures/ModerationData';
import WarnAction from '../../structures/actions/WarnAction';

class Warn extends Command {
  constructor() {
    super('Warn');
    this.aliases = ['warn'];
    this.usage = 'warn <@mention | ID> <raison>';
    this.examples = ["warn @polymeth Irrespect du format d'aide"];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.mentions.members.first() || message.guild.members.resolve(args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);
    if (!args[1]) return message.channel.sendError(this.config.missingReasonArgument, message.member);
    if (victim.id === message.author.id) return message.channel.sendError(this.config.noSelfWarn, message.member);
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.userTooPowerful, message.member);

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    const data = new ModerationData()
      .setType(ACTION_TYPE.WARN)
      .setColor(config.colors.warn)
      .setReason(reason)
      .setDuration(config.moderation.warnDuration * 1000)
      .setMember(victim)
      .setModerator(message.member)
      .setMessageChannel(message.channel)
      .setFinishTimestamp();
    new WarnAction(data).commit();
  }
}

export default Warn;
