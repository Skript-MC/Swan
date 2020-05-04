import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { config, client } from '../../main';

class Idea extends Command {
  constructor() {
    super('Idea');
    this.aliases = ['idée', 'idee', 'idea'];
    this.usage = 'idea';
    this.examples = ['idea'];
  }

  async execute(message, _args) {
    const ideaMessages = await client.channels.cache.get(config.channels.idea).messages.fetch();
    const randomIdea = ideaMessages.array()[Math.floor(Math.random() * ideaMessages.array().length)];
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Idée de ${randomIdea.author.nickname || randomIdea.author.username} :`, randomIdea.author.avatarURL())
      .setDescription(randomIdea.content)
      .setFooter(`Exécuté par ${message.member.nickname || message.author.username}`)
      .setTimestamp(randomIdea.createdAt);

    message.channel.send(embed);
  }
}

export default Idea;
