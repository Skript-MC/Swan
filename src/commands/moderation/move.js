import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { discordError } from '../../structures/messages';
import { config } from '../../main';

class Move extends Command {
  constructor() {
    super('Move Message');
    this.aliases = ['move'];
    this.usage = 'move <@mention salon> <ID message>';
    this.examples = ['move #skript-2 687032391075889161'];
    this.permissions = ['Staff'];
    this.enabledInHelpChannels = true;
  }

  async execute(message, args) {
    // On récupère le salon, vérifie qu'il existe et qu'il n'est pas le même avant de faire une requête à l'API Discord.
    const targetedChannel = message.mentions.channels.first();
    if (!args[0] || !targetedChannel) return message.channel.send(discordError(this.config.invalidChannel, message));
    if (targetedChannel.id === message.channel.id) return message.channel.send(discordError(this.config.sameChannel, message));
    if (!config.channels.helpSkript.includes(message.channel.id) || !config.channels.helpSkript.includes(targetedChannel.id)) return message.channel.send(discordError(this.config.restrictedChannel, message));
    const targetedMessage = await message.channel.messages.fetch(args[1]).catch(console.error);
    if (!args[1] || !targetedMessage) return message.channel.send(discordError(this.config.invalidMessage, message));
    // On déplace le message dans le salon demandé en supprimant l'ancien (ainsi que l'exécuteur de la commande).
    message.delete();
    targetedMessage.delete();
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Message de ${targetedMessage.member.nickname || targetedMessage.author.username} :`, targetedMessage.author.avatarURL())
      .setDescription(targetedMessage.content)
      .setFooter(`Déplacé par ${message.member.nickname || message.author.username}.`)
      .setTimestamp();
    const MoveEmbed = await targetedChannel.send(embed);
    // On permet à celui qui a déplacé le message de le supprimer (s'il s'est trompé).
    // await MoveEmbed.react('🗑️');
    MoveEmbed
      .createReactionCollector((reaction, user) => (user.id === message.author.id && reaction.emoji.name === '🗑️') && !user.bot)
      .on('collect', () => {
        MoveEmbed.delete();
      });
  }
}

export default Move;
