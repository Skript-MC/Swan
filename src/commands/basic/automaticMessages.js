import Command from '../../components/Command';
import { discordError } from '../../components/Messages';

class AutomaticMessages extends Command {
  constructor() {
    super('Automatic Messages');
    this.regex = /auto(mati(que|c))?(-|_)?(messages?|msg)?/gimu;
    this.usage = 'automsg <nom du message>';
    this.examples.push('automsg asktoask');
  }

  async execute(message, args) {
    const arg = args.join(' ');
    if (args.length === 0) return discordError(this.config.noArg.replace('%s', `\n - ${Object.keys(this.config.messages).join('\n - ')}\n`), message);
    if (arg.match(/ask\s?to\s?ask/gimu)) return message.channel.send(this.config.messages.asktoask.content);
    else if (arg.match(/help\s?template/gimu)) return message.channel.send(this.config.messages.helptemplate.content);
    else if (arg.match(/internal\s?(error)?/gimu)) return message.channel.send(this.config.messages.internalerror.content);
    else if (arg.match(/(deprecated|old\s?addon)/gimu)) return message.channel.send(this.config.messages.deprecated.content);
    else if (arg.match(/gui-pv/gimu)) {
      try {
        await message.member.send(this.config.messages.gui.longContent1);
        await message.member.send(this.config.messages.gui.longContent2);
        return message.react('✅');
      } catch (e) {
        message.react('❌');
        return message.reply("désolé, mais je ne peux pas t'envoyer de message privé ! vérifie qu'ils soient activer et que tu ne m'ai pas bloqué.");
      }
    } else if (arg.match(/gui/gimu)) return message.channel.send(this.config.messages.gui.shortContent);
    else if (arg.match(/every\s?loop/gimu)) return message.channel.send(this.config.messages.everyloop.content);
    else if (arg.match(/(long)?code/gimu)) return message.channel.send(this.config.messages.longcode.content);
    else if (arg.match(/ver(sion)?/gimu)) return message.channel.send(this.config.messages.version.content);
    else if (arg.match(/ya?ml/gimu)) return message.channel.send(this.config.messages.yaml.content);
    else if (arg.match(/list-pv/gimu)) {
      try {
        message.member.send(this.config.messages.list.pvContent);
        return message.react('✅');
      } catch (e) {
        message.react('❌');
        return message.reply("désolé, mais je ne peux pas t'envoyer de message privé ! vérifie qu'ils soient activer et que tu ne m'ai pas bloqué.");
      }
    } else if (arg.match(/liste?/gimu)) return message.channel.send(this.config.messages.list.content);
    else if (arg.match(/(?:§|uselesscommand)/gimu)) return message.channel.send(this.config.messages.uselesscommand.content);
    else if (arg.match(/1.?8(?:.\d*)?/gimu)) return message.channel.send(this.config.messages['18'].content);
    else return discordError(this.config.invalidMessage, message);
  }
}

export default AutomaticMessages;
