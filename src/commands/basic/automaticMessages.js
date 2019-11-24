import Command from '../../helpers/Command';
import { discordError } from '../../helpers/Messages';
import { config } from '../../main';
import { uncapitalize, jkDistance } from '../../utils';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class AutomaticMessages extends Command {
  constructor() {
    super('Automatic Messages');
    this.aliases = ['automaticmessage', 'automatic_message', 'automatic-message', 'automsg', 'auto_msg', 'auto-msg', 'auto'];
    this.usage = 'automsg <nom du message>';
    this.examples = ['automsg asktoask'];
  }

  async execute(message, args) {
    const arg = args.join(' ');
    const messages = this.config.messages;

    if (args.length === 0) message.channel.send(discordError(this.config.noArg.replace('%s', `\`${Object.keys(this.config.messages).join(', ')}\``), message));
    else if (arg === 'gui-pv' || arg === 'list-pv') {
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
    } else if (messages.asktoask.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.asktoask.content);
    else if (messages.helptemplate.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.helptemplate.content);
    else if (messages.internalerror.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.internalerror.content);
    else if (messages.deprecated.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.deprecated.content);
    else if (messages.gui.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.gui.shortContent);
    else if (messages.everyloop.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.everyloop.content);
    else if (messages.longcode.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.longcode.content);
    else if (messages.version.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.version.content);
    else if (messages.list.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.list.content);
    else if (messages.uselesscommand.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.uselesscommand.content);
    else if (messages['1.8'].templates.some(elt => elt === arg)) message.channel.send(this.config.messages['1.8'].content);
    else if (messages.contains.templates.some(elt => elt === arg)) message.channel.send(this.config.messages.contains.content);
    else if (messages['skellett1.14'].templates.some(elt => elt === arg)) message.channel.send(this.config.messages['skellett1.14'].content);
    else {
      const matches = [];

      for (const msg of Object.values(messages)) {
        for (const elt of msg.templates) {
          if (jkDistance(arg, elt) >= this.config.similarity) matches.push(elt);
          break;
        }
      }

      if (matches.length === 0) {
        const errorMsg = await message.channel.send(discordError(this.config.invalidMessage, message));
        errorMsg.delete(10000);
      } else {
        const messagesList = matches.map(elt => uncapitalize(elt.replace(/ /g, ''))).join('`, `.automsg ');
        const suggestion = await message.channel.send(this.config.cmdSuggestion.replace('%c', args.join('')).replace('%m', messagesList));

        if (matches.length === 1) suggestion.react('✅');
        else for (let i = 0; i < reactionsNumbers.length && i < matches.length; i++) await suggestion.react(reactionsNumbers[i]);

        const collector = suggestion
          .createReactionCollector((reaction, user) => !user.bot
              && user.id === message.author.id
              && (reaction.emoji.name === '✅' || reactionsNumbers.includes(reaction.emoji.name)))
          .once('collect', (reaction) => {
            collector.stop();
            suggestion.delete();
            const index = reaction.emoji.name === '✅' ? 0 : reactionsNumbers.indexOf(reaction.emoji.name);
            return this.execute(message, [matches[index]]);
          });
      }
    }
  }
}

export default AutomaticMessages;
