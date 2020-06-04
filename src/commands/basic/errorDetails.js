import Command from '../../structures/Command';
import { uncapitalize, jwDistance } from '../../utils';
import { db } from '../../main';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class ErrorDetails extends Command {
  constructor() {
    super('Error Details');
    this.aliases = ['errordetail', 'errordetails', 'error_detail', 'error_details', 'error-detail', 'error-details', 'error'];
    this.usage = 'errordetail <votre erreur>';
    this.examples = ["errordetail Can't compare 'if arg 1' with a text"];
  }

  async execute(client, message, args) {
    const arg = args.join(' ');
    const messages = await db.messages.find({ type: 'error' }).catch(console.error);

    if (args.length === 0) {
      const allMessages = [];
      messages.filter(msg => allMessages.push(msg.title));
      message.channel.sendError(this.config.noArg.replace('%s', `\`${allMessages.join(', ')}\``), message.member);
      return;
    }

    for (const autoMessage of messages) {
      if (autoMessage.aliases.some(elt => elt === arg) || autoMessage.title === arg) {
        if (arg.includes('-pv')) {
          try {
            await message.member.send(autoMessage.content);
            message.react('✅').catch(console.error);
          } catch (e) {
            message.react('❌').catch(console.error);
            message.reply(client.config.messages.errors.privatemessage);
          }
        } else {
          message.channel.send(autoMessage.content);
        }
        return;
      }
    }

    const matches = [];

    for (const msg of messages) {
      for (const elt of msg.aliases) {
        console.log(arg, elt);
        if (jwDistance(arg, elt) >= this.config.similarity) matches.push(elt);
        break;
      }
    }

    if (matches.length === 0) {
      message.channel.sendError(this.config.invalidMessage, message.member);
    } else {
      const messagesList = matches.map(elt => uncapitalize(elt.replace(/ /g, ''))).join('`, `.error ');
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

export default ErrorDetails;
