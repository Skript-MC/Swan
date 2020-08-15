import { db } from '../main';
import { jwDistance, uncapitalize } from '../utils';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

export default async function searchMessage(client, message, args, type) {
  const search = args.join(' ');
  const messages = await db.messages.find({ type }).catch(console.error);

  if (args.length === 0) {
    message.channel.sendError(client.config.messages.utils.searchmessage.noArg.replace('%s', `\`${messages.map(msg => msg.title).join(', ')}\``), message.member);
    return;
  }

  for (const match of messages) {
    if (match.aliases.some(elt => elt === search) || match.title === search) {
      if (search.endsWith('-pv')) {
        try {
          await message.member.send(match.content);
          message.react('✅').catch(console.error);
        } catch (e) {
          message.react('❌').catch(console.error);
          message.reply(client.config.messages.errors.privatemessage);
        }
      } else {
        const msg = await message.channel.send(match.content);
        await msg.react('🗑️');
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
      if (jwDistance(search, elt) >= client.config.messages.utils.searchmessage.similarity) matches.push(elt);
      break;
    }
  }

  if (matches.length === 0) {
    const msg = await message.channel.sendError(client.config.messages.utils.searchmessage.invalidMessage, message.member);
    await msg.react('🗑️');
    const removeCollector = msg
      .createReactionCollector((reaction, user) => reaction.emoji.name === '🗑️' && user.id === message.author.id)
      .once('collect', () => {
        removeCollector.stop();
        msg.delete();
        message.delete();
      });
  } else {
    const suggestion = await message.channel.send(client.config.messages.utils.searchmessage.cmdSuggestion.replace('%c', args.join('')).replace('%m', matches.map(elt => uncapitalize(elt.replace(/ /g, ''))).join(`\`, \`.${type} `)).replace('%t', type));

    if (matches.length === 1) await suggestion.react('✅');
    else for (let i = 0; i < reactionsNumbers.length && i < matches.length; i++) await suggestion.react(reactionsNumbers[i]);

    const collector = suggestion
      .createReactionCollector((reaction, user) => !user.bot
        && user.id === message.author.id
        && (reaction.emoji.name === '✅' || reactionsNumbers.includes(reaction.emoji.name)))
      .once('collect', (reaction) => {
        collector.stop();
        suggestion.delete();
        const index = reaction.emoji.name === '✅' ? 0 : reactionsNumbers.indexOf(reaction.emoji.name);
        return searchMessage(client, message, [matches[index]], type);
      });
  }
}
