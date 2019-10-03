import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config } from '../../main';

class AutomaticMessages extends Command {
  constructor() {
    super('Automatic Messages');
    this.aliases = ['automaticmessage', 'automatic_message', 'automatic-message', 'automsg', 'auto_msg', 'auto-msg', 'auto'];
    this.usage = 'automsg <nom du message>';
    this.examples = ['automsg asktoask'];
  }

  async execute(message, args) {
    const arg = args.join(' ');

    if (args.length === 0) message.channel.send(discordError(this.config.noArg.replace('%s', `\`${Object.keys(this.config.messages).join(', ')}\``), message));
    else if (arg.match(/gui-pv/gimu) || arg.match(/list-pv/gimu)) {
      try {
        if (arg.includes('gui')) {
          await message.member.send(this.config.messages.gui.longContent1);
          await message.member.send(this.config.messages.gui.longContent2);
        } else message.member.send(this.config.messages.list.pvContent);
        message.react('✅');
      } catch (e) {
        message.react('❌');
        message.reply(config.messages.errors.privatemessage);
      }
    } else if (arg.match(/test/gimu)) message.channel.send(this.config.messages.test.content);
    else if (arg.match(/ask\s?to\s?ask/gimu)) message.channel.send(this.config.messages.asktoask.content);
    else if (arg.match(/help\s?template/gimu)) message.channel.send(this.config.messages.helptemplate.content);
    else if (arg.match(/internal\s?(error)?/gimu)) message.channel.send(this.config.messages.internalerror.content);
    else if (arg.match(/(deprecated|old\s?addon)/gimu)) message.channel.send(this.config.messages.deprecated.content);
    else if (arg.match(/gui/gimu)) message.channel.send(this.config.messages.gui.shortContent);
    else if (arg.match(/every\s?loop/gimu)) message.channel.send(this.config.messages.everyloop.content);
    else if (arg.match(/(long)?code/gimu)) message.channel.send(this.config.messages.longcode.content);
    else if (arg.match(/ver(sion)?/gimu)) message.channel.send(this.config.messages.version.content);
    else if (arg.match(/liste?/gimu)) message.channel.send(this.config.messages.list.content);
    else if (arg.match(/(?:§|uselesscommand)/gimu)) message.channel.send(this.config.messages.uselesscommand.content);
    else if (arg.match(/1.?8(?:.\d*)?/gimu)) message.channel.send(this.config.messages['18'].content);
    else if (arg.match(/contains?/gimu)) message.channel.send(this.config.messages.contains.content);
    else if (arg.match(/skell?ett?(?:(?:1\.)?14)?/gimu)) message.channel.send(this.config.messages.skellett14.content);
    else {
      const error = await message.channel.send(discordError(this.config.invalidMessage, message));
      error.delete(10000);
    }
  }
}

export default AutomaticMessages;
