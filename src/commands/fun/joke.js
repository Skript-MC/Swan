import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { config, db } from '../../main';

class Joke extends Command {
  constructor() {
    super('Joke');
    this.aliases = ['joke', 'blague', 'lol'];
    this.usage = 'joke';
    this.examples = ['joke'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, _args) {
    const jokes = this.config.jokes;
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    const id = jokes.indexOf(joke);
    await this.updateStats(id);
    const embed = await this.buildEmbed(message, id);
    const jokeEmbed = await message.channel.send(embed);
    await jokeEmbed.react('😄');
    await jokeEmbed.react('🙄');

    jokeEmbed
      .createReactionCollector((_reaction, user) => {
        return !user.bot;
      }).on('collect', async (reaction) => {
        if (reaction.emoji.name === '😄' || reaction.emoji.name === '🙄') {
          this.like(message, jokeEmbed, reaction.emoji.name === '😄' ? 'like' : 'dislike', message.author, id);
        }
    })
  }

  async buildEmbed(message, id) {
    const joke = this.config.jokes[id];
    const split = joke.split(';');
    const jokeDoc = await db.jokes.findOne({ id }).catch(console.error);
    const likes = jokeDoc.likes.length;
    const dislikes = jokeDoc.dislikes.length;
    const views = jokeDoc.views
    return new MessageEmbed()
      .setTitle(":small_blue_diamond: " + split[0])
      .setDescription(split[1])
      .setColor(config.colors.default)
      .setFooter(`Exécuté par ${message.author.username}. Statistiques : ${likes} 😄 - ${dislikes} 🙄 - ${views} 👀`)
      .setTimestamp();
  }

  async updateStats(id) {
    const joke = await db.jokes.findOne({ id }).catch(console.error);
    if (joke) {
      await db.jokes.update(
        { _id: joke._id },
        { $set: { send: joke.views + 1 } },
      ).catch(console.error);
    } else {
      await db.jokes.insert(
        { id: id, views: 1, likes: [], dislikes: [] },
      ).catch(console.error);
    }
  }

  async like(message, jokeEmbed, type, users, id) {
    const joke = await db.jokes.findOne({ id }).catch(console.error);
    const options = { returnUpdatedDocs: true, multi: false };
    const userId = users.id;
    let updated = false;
    if (joke !== null) {
      if (joke.likes.includes(userId) && type === 'like') {
        // Déjà like (la réaction est déjà mise)
        message.channel.send(this.config.alreadyLiked).then(msg => msg.delete({ timeout: 5000 }));
      } else if (joke.dislikes.includes(userId) && type === 'dislike') {
        // Déjà dislike (la réaction est déjà mise)
        message.channel.send(this.config.alreadyDisliked).then(msg => msg.delete({ timeout: 5000 }));
      } else if (joke.likes.includes(userId) && type === 'dislike') {
        // On a like et on veut dislike
        await db.jokes.update({ _id: joke._id }, { $pull: { likes: userId } }, options).catch(console.error);
        await db.jokes.update({ _id: joke._id }, { $push: { dislikes: userId } }, options).catch(console.error);

        // Collection des utilisateurs ayant mis la réaction 😄
        const likers = jokeEmbed.reactions.cache.find(reaction => reaction.emoji.name === '😄').users;
        if (typeof likers.cache.get(message.author.id) !== 'undefined') likers.remove(message.author);

        updated = true;
      } else if (joke.dislikes.includes(userId) && type === 'like') {
        // On a dislike et on veut like
        await db.jokes.update({ _id: joke._id }, { $pull: { dislikes: userId } }, options).catch(console.error);
        await db.jokes.update({ _id: joke._id }, { $push: { likes: userId } }, options).catch(console.error);

        // Collection des utilisateurs ayant mis la réaction 🙄
        const dislikers = jokeEmbed.reactions.cache.find(reaction => reaction.emoji.name === '🙄').users;
        if (typeof dislikers.cache.get(message.author.id) !== 'undefined') dislikers.remove(message.author);

        updated = true;
      } else if (type === 'like') {
        // On veut like
        await db.jokes.update({ _id: joke._id }, { $push: { likes: userId } }).catch(console.error);
        updated = true;
      } else if (type === 'dislike') {
        // On veut dislike
        await db.jokes.update({ _id: joke._id }, { $push: { dislikes: userId } }).catch(console.error);
        updated = true;
      }

      if (updated) {
        // Rechargement de la database, pour supprimer la duplication que `update` a créée
        await db.jokes.load().catch(console.error);

        message.channel.send(type === 'like' ? this.config.liked : this.config.disliked)
          .then(msg => msg.delete({ timeout: 5000 }));
      }
    }
  }

}
export default Joke;