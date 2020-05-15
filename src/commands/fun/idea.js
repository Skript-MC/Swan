import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';

class Idea extends Command {
  constructor() {
    super('Idée');
    this.aliases = ['idée', 'idee', 'idea'];
    this.usage = 'idea';
    this.examples = ['idea'];
  }

  async execute(client, message, _args) {
    const ideaMessages = await client.channels.resolve(client.config.channels.idea).messages.fetch();
    const randomIdea = ideaMessages.array()[Math.floor(Math.random() * ideaMessages.array().length)];
    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .setAuthor(`Idée de ${randomIdea.member.displayName} :`, randomIdea.author.avatarURL())
      .setDescription(randomIdea.content)
      .setFooter(`Exécuté par ${message.member.displayName}`)
      .setTimestamp(randomIdea.createdAt);

    message.channel.send(embed);
  }
}

export default Idea;
