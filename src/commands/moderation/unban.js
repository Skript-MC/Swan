import Command from '../../structures/Command';
import ModerationData from '../../structures/ModerationData';
import UnbanAction from '../../structures/actions/UnbanAction';
import ACTION_TYPE from '../../structures/actions/actionType';
import { config, client } from '../../main';

class Unban extends Command {
  constructor() {
    super('Unban');
    this.aliases = ['unban'];
    this.usage = 'unban <@mention | ID> [<raison>]';
    this.examples = ["unban @Acenox Oups je voulais ban qqun d'autre"];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    // The only moderation command where the victim might be a User, not a GuildMember, because if he is
    // hardban, then he can't be a GuildMember as he's not in the guild anymore
    args[0] = args[0].replace(/<@!(\d*)>/gimu, '$1'); // eslint-disable-line no-param-reassign
    const victim = message.mentions.members.first()
      || message.guild.members.resolve(args[0])
      || await client.users.fetch(args[0]);

    if (!victim) return message.channel.sendError(this.config.missingUserArgument, message.member);

    const reason = args.splice(1).join(' ') || this.config.noReasonSpecified;

    const data = new ModerationData()
      .setType(ACTION_TYPE.UNBAN)
      .setColor(config.colors.success)
      .setVictim(victim)
      .setReason(reason)
      .setModerator(message.member)
      .setMessageChannel(message.channel);
    new UnbanAction(data).commit();
  }
}

export default Unban;
