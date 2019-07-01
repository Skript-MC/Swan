import Command from '../../components/Command';
import { discordError } from '../../components/Messages';

class ErrorFinder extends Command {
  constructor() {
    super('Error Finder');
    this.regex = /(find(_|-)?my(_|-)?err(or)?|trouve(_|-)?mon(_|-)?err(eure?)?)/gmui;
    this.usage = 'findmyerror <votre erreur>';
    this.examples.push("findmyerror Can't compare 'if arg 1' with a text");
  }

  async execute(message, args) {
    if (args.length === 0) return discordError("Tu n'as pas défini d'erreur !", message);

    const arg = args.join(' ').toLowerCase();

    if (arg.match(/indentation/gmui)) {
      message.channel.send(this.config.error.indentation);
    } else if (arg.match(/can't understand this/gmui)) {
      message.channel.send(this.config.error.cantunderstand);
    } else if (arg.match(/empty configuration section/gmui)) {
      message.channel.send(this.config.error.emptysection);
    } else if (arg.match(/invalid use of quotes/gmui)) {
      message.channel.send(this.config.error.invalidquotes);
    } else if (arg.match(/there's no loop that match/gmui)) {
      message.channel.send(this.config.error.noloopmatch);
    } else if (arg.match(/"else" has to be place just after an "if"/gmui)) {
      message.channel.send(this.config.error.elseafterif);
    } else if (arg.match(/can't compare/gmui)) {
      message.channel.send(this.config.error.cantcompare);
    } else if (arg.match(/can't be added to/gmui)) {
      message.channel.send(this.config.error.cantbeadded);
    } else {
      message.channel.send(this.config.error.other);
    }
  }
}

export default ErrorFinder;
