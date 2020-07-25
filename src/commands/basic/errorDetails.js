import Command from '../../structures/Command';
import { db } from '../../main';

class ErrorDetails extends Command {
  constructor() {
    super('Error Details');
    this.aliases = ['errordetail', 'errordetails', 'error_detail', 'error_details', 'error-detail', 'error-details', 'error'];
    this.usage = 'errordetail <votre erreur>';
    this.examples = ["errordetail Can't compare 'if arg 1' with a text"];
  }

  async execute(_client, message, args) {
    const arg = args.join(' ').toLowerCase();
    const messages = await db.messages.find({ type: 'error' }).catch(console.error);

    if (args.length === 0) {
      const allMessages = [];
      messages.filter(msg => allMessages.push(msg.aliases[0]));
      message.channel.sendError(this.config.noArg.replace('%s', `\`${allMessages.join(', ')}\``), message.member);
      return;
    }

    for (const msg of messages) {
      for (const aliase of msg.aliases) {
        if (arg.includes(aliase) || arg.includes(msg.title)) {
          const msgContent = await message.channel.send(msg.content);
          msgContent.react('🗑️');
          const removeCollector = msgContent
            .createReactionCollector((reaction, user) => reaction.emoji.name === '🗑️' && user.id === message.author.id)
            .once('collect', () => {
              removeCollector.stop();
              msgContent.delete();
              message.delete();
            });
          return;
        }
      }
    }
    const msg = await message.channel.send(this.config.invalidMessage);
    msg.react('🗑️');
    const removeCollector = msg
      .createReactionCollector((reaction, user) => reaction.emoji.name === '🗑️' && user.id === message.author.id)
      .once('collect', () => {
        removeCollector.stop();
        msg.delete();
        message.delete();
      });
  }
}

export default ErrorDetails;
