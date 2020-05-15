import Command from '../../structures/Command';

class ErrorDetails extends Command {
  constructor() {
    super('Error Details');
    this.aliases = ['errordetail', 'errordetails', 'error_detail', 'error_details', 'error-detail', 'error-details'];
    this.usage = 'errordetail <votre erreur>';
    this.examples = ["errordetail Can't compare 'if arg 1' with a text"];
  }

  async execute(_client, message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.noError, message.member);

    const arg = args.join(' ').toLowerCase();

    if (arg.match(/indentation/gimu)) message.channel.send(this.config.error.indentation);
    else if (arg.match(/can't understand this/gimu)) message.channel.send(this.config.error.cantunderstand);
    else if (arg.match(/empty configuration section/gimu)) message.channel.send(this.config.error.emptysection);
    else if (arg.match(/invalid use of quotes/gimu)) message.channel.send(this.config.error.invalidquotes);
    else if (arg.match(/there's no loop that match/gimu)) message.channel.send(this.config.error.noloopmatch);
    else if (arg.match(/"else" has to be place just after an "if"/gimu)) message.channel.send(this.config.error.elseafterif);
    else if (arg.match(/can't compare/gimu)) message.channel.send(this.config.error.cantcompare);
    else if (arg.match(/can't be added to/gimu)) message.channel.send(this.config.error.cantbeadded);
    else if (arg.match(/There's no player in/gimu)) message.channel.send(this.config.error.noplayer);
    else if (arg.match(/code has to be put in triggers/gimu)) message.channel.send(this.config.error.codeintriggers);
    else if (arg.match(/because it's a single value/gimu)) message.channel.send(this.config.error.cantloopsinglevalue);
    else message.channel.sendError(this.config.error.unknown, message.member);
  }
}

export default ErrorDetails;
