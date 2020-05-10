import Command from '../../structures/Command';
import ModerationData from '../../structures/ModerationData';
import ACTION_TYPE from '../../structures/actions/actionType';
import { config } from '../../main';
import RemoveWarnAction from '../../structures/actions/RemoveWarnAction';

class RemoveWarn extends Command {
  constructor() {
    super('Remove Warn');
    this.aliases = ['removewarn', 'remwarn', 'deletewarn', 'delwarn', 'unwarn'];
    this.usage = 'removewarn <@mention | ID utilisateur> <ID warn> [<raison>]';
    this.examples = ['removewarn @polymeth nZPiWKem En fait trkl il m\'a payé'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.mentions.members.first() || message.guild.members.resolve(args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);

    const id = args[1];
    if (!id) return message.channel.sendError(this.config.missingIdArgument, message.member);

    const reason = args.splice(2).join(' ') || this.config.noReasonSpecified;

    const data = new ModerationData()
      .setType(ACTION_TYPE.REMOVE_WARN)
      .setColor(config.colors.success)
      .setMember(victim)
      .setReason(reason)
      .setWarnId(id)
      .setModerator(message.member)
      .setMessageChannel(message.channel);
    new RemoveWarnAction(data).commit();
  }
}

export default RemoveWarn;
