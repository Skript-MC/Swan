import Command from '../../structures/Command';
import { uncapitalize, jwDistance } from '../../utils';
import { db } from '../../main';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class AutomaticMessages extends Command {
  constructor() {
    super('Automatic Messages');
    this.aliases = ['automaticmessage', 'automaticmessages', 'automsg', 'auto_msg', 'auto-msg', 'auto'];
    this.usage = 'automsg <nom du message>';
    this.examples = ['automsg asktoask'];
  }

  async execute(client, message, args) {
    const arg = args.join(' ');
    const messages = await db.messages.find({ type: 'auto' }).catch(console.error);

    if (args.length === 0) {
      const allMessages = [];
      messages.filter(msg => allMessages.push(msg.title));
      message.channel.sendError(this.config.noArg.replace('%s', `\`${allMessages.join(', ')}\``), message.member);
      return;
    }

    for (const autoMessage of messages) {
      if (autoMessage.aliases.some(elt => elt === arg)) {
        if (arg.endsWith('-pv')) {
          try {
            await message.member.send(autoMessage.content);
            message.react('✅').catch(console.error);
          } catch (e) {
            message.react('❌').catch(console.error);
            message.reply(client.config.messages.errors.privatemessage);
          }
        } else {
          const msg = await message.channel.send(autoMessage.content);
          msg.react('🗑️');
          const removeCollector = msg
            .createReactionCollector((reaction, user) => reaction.emoji.name === '🗑️' && user.id === message.author.id)
            .once('collect', () => {
              removeCollector.stop();
              msg.delete();
              message.delete();
            });
        }
        return;
      }
    }

    const matches = [];

    for (const msg of messages) {
      for (const elt of msg.aliases) {
        if (jwDistance(arg, elt) >= this.config.similarity) matches.push(elt);
        break;
      }
    }

    if (matches.length === 0) {
      message.channel.sendError(this.config.invalidMessage, message.member);
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
          return this.execute(client, message, [matches[index]]);
        });
    }
  }
}

export default AutomaticMessages;
