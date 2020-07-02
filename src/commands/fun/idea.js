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
    const channel = client.channels.resolve(client.config.channels.idea);
    if (!channel) return message.channel.send(this.config.noChannelFound);

    const ideas = await channel.messages.fetch();
    if (!ideas) return message.channel.send(this.config.noMesagesFound);

    const randomIdea = ideas.random(1);

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
