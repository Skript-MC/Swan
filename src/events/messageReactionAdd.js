import { client, db } from '../main';
import endPoll from '../structures/endPoll';

const pollsReactions = {
  yesno: ['✅', '❌'],
  multiple: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'],
  specials: ['ℹ', '🛑'],
};
export default async function messageReactionAddHandler(reaction, user) {
  if (user.bot) return;
  const { message } = reaction;
  const polls = await db.polls.find({}).catch(console.error);
  const poll = polls.find(p => p.id === reaction.message.id);
  const member = message.guild.members.resolve(user.id);

  if (poll) {
    if ((poll.type === 0 && pollsReactions.yesno.includes(reaction.emoji.name))
      || (poll.type === 1 && pollsReactions.multiple.includes(reaction.emoji.name))) {
      // On trouve ou dans quelle catégorie il a voté (undefined s'il n'a pas voté)
      const userVote = Object.entries(poll.votes).find(entry => (entry[1].includes(user.id) ? entry : null))?.[0];

      if (userVote === reaction.emoji.name) {
        // Déjà voté pour cette option
        message.channel.send(client.config.messages.commands.poll.alreadyVotedThis.replace('%m', member.toString()))
          .then(msg => msg.delete({ timeout: 5000 }));
      } else if (userVote) {
        // On a voté, mais on veut changer
        await db.polls.update(
          { id: poll.id },
          { $pull: { [`votes.${[userVote]}`]: user.id },
            $push: { [`votes.${[reaction.emoji.name]}`]: user.id } },
        ).catch(console.error);
        if (!poll.isAnonymous) {
          const userReactions = message.reactions.cache.find(r => r.emoji.name === userVote).users;
          if (typeof userReactions.cache.get(user.id) !== 'undefined') userReactions.remove(user);
        } else {
          reaction.users.remove(user);
        }
      } else {
        // On veut voter
        await db.polls.update({ id: poll.id }, { $push: { [`votes.${[reaction.emoji.name]}`]: user.id } }).catch(console.error);
        if (poll.isAnonymous) reaction.users.remove(user);
      }
    } else if (pollsReactions.specials[1] === reaction.emoji.name && user.id === poll.creator) {
      endPoll(client, db, poll, true);
    } else if (pollsReactions.specials[0] === reaction.emoji.name) {
      reaction.users.remove(user);
      try {
        const conf = client.config.messages.commands.poll;
        const text = poll.type === 0 ? conf.pollInfosYesNo : conf.pollInfosCustom;
        await member.send(text).catch(() => { throw new Error(); });
        const info = await reaction.message.channel.send(conf.infosSent.replace('%m', member.toString()));
        info.delete({ timeout: 5000 });
      } catch (e) {
        message.channel.send(`${member.toString()}, ${client.config.messages.errors.privatemessage}`);
      }
    }
  } else if (message.channel.id === client.config.channels.suggestion) {
    const { guild } = message;
    const link = `https://discordapp.com/channels/${guild.id}/${client.config.channels.suggestion}/${message.id}`;

    if (reaction.emoji.name === '✅') {
      const reactionners = message.reactions.cache.find(r => r.emoji.name === '❌').users;
      if (typeof reactionners.cache.get(user.id) !== 'undefined') reactionners.remove(user);

      const positive = reaction.count;
      if (positive === 20) {
        guild.channels.cache.get(client.config.channels.main).send(`:fire: La suggestion de ${message.embeds[0].title.replace(/Suggestion de (\w+) \(\d+\)/, '$1')} devient populaire ! Elle a déjà 20 avis positifs !\nAvez-vous pensé à y jeter un oeil ? Qu'en pensez-vous ?\nLien : ${link}`);
      }
    } else if (reaction.emoji.name === '❌') {
      const reactionners = message.reactions.cache.find(r => r.emoji.name === '✅').users;
      if (typeof reactionners.cache.get(user.id) !== 'undefined') reactionners.remove(user);

      const negative = reaction.count;
      if (negative === 10) {
        guild.channels.cache.get(client.config.channels.logs).send(`:warning: La suggestion de ${message.embeds[0].title.replace(/Suggestion de (\w+) \(\d+\)/, '$1')} a reçu beaucoup de réactions négatives ! Elle a 10 avis contre.\nLien : ${link}`);
      }
    }
  }
}
