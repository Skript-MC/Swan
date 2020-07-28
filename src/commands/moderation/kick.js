import Command from '../../structures/Command';
import ModerationData from '../../structures/ModerationData';
import ACTION_TYPE from '../../structures/actions/actionType';
import KickAction from '../../structures/actions/KickAction';

class Kick extends Command {
  constructor() {
    super('Kick');
    this.aliases = ['kick'];
    this.usage = 'kick <@mention | ID> [<raison>]';
    this.examples = ['kick @WeeksyBDW C\'est pas bien !'];
    this.permissions = ['Staff'];
  }

  async execute(client, message, args) {
    const victim = message.mentions.members.first() || message.guild.members.resolve(args[0]);
    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);
    if (victim.id === message.author.id) return message.channel.sendError(this.config.noSelfKick, message.member);
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.userTooPowerful, message.member);

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    const data = new ModerationData()
      .setType(ACTION_TYPE.KICK)
      .setColor(client.config.colors.kick)
      .setReason(reason)
      .setModerator(message.member)
      .setMessageChannel(message.channel);
    await data.setVictimId(victim.id);

    new KickAction(data).commit();
  }
}

export default Kick;
