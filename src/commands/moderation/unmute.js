import Command from '../../structures/Command';
import ModerationData from '../../structures/ModerationData';
import ACTION_TYPE from '../../structures/actions/actionType';
import { config } from '../../main';
import UnmuteAction from '../../structures/actions/UnmuteAction';

class Unmute extends Command {
  constructor() {
    super('Unmute');
    this.aliases = ['unmute'];
    this.usage = 'unmute <@mention | ID> [<raison>]';
    this.examples = ['unmute @4rno G mété tronpé hé'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.mentions.members.first() || message.guild.members.resolve(args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    const data = new ModerationData()
      .setType(ACTION_TYPE.UNMUTE)
      .setColor(config.colors.success)
      .setMember(victim)
      .setReason(reason)
      .setModerator(message.member)
      .setMessageChannel(message.channel);
    new UnmuteAction(data).commit();
  }
}

export default Unmute;
