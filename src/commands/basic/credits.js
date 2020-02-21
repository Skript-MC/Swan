import Command from '../../helpers/Command';
import CreditsManager from '../../helpers/CreditsManager';

class Credits extends Command {
  constructor() {
    super('Credits');
    this.aliases = ['credits', 'credit', 'crédits', 'crédit'];
    this.usage = 'credits [<@mention | ID>]';
    this.examples = ['credits', 'crédits 191495299884122112'];
    this.enabled = false;
  }

  async execute(message, args) {
    const target = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]) || message.member;

    const credits = await CreditsManager.getMemberCredits(target);
    message.channel.send(this.config.creditsAmount
      .replace('%s', target.nickname || target.user.username)
      .replace('%d', credits));
  }
}

export default Credits;
