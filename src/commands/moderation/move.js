import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { discordError, discordInfo } from '../../structures/messages';
import { config } from '../../main';

class Move extends Command {
  constructor() {
    super('Move Message');
    this.aliases = ['move', 'MoveMessage'];
    this.usage = 'move <#mention salon> <ID message>';
    this.examples = ['move #skript-2 687032391075889161'];
    this.permissions = ['Staff'];
    this.enabledInHelpChannels = true;
  }

  async execute(message, args) {
    // On récupère le salon, vérifie qu'il existe, qu'il est autorisé et qu'il n'est pas le même avant de faire une requête à l'API Discord.
    const targetedChannel = message.mentions.channels.first();
    if (!args[0] || !targetedChannel) return message.channel.send(discordError(this.config.invalidChannel, message));
    if (targetedChannel.id === message.channel.id) return message.channel.send(discordError(this.config.sameChannel, message));
    const helpChannels = [
      ...config.channels.helpSkript,
      ...config.channels.helpOther,
    ];
    if (!helpChannels.includes(message.channel.id) || !helpChannels.includes(targetedChannel.id)) return message.channel.send(discordError(this.config.restrictedChannel, message));

    // C'est bon ! On envoie la requête à l'API Discord et on vérifie s'il renvoie un message existant.
    // On vérifie ensuite si le déplacement n'est pas trop puissant (rôle targetedMessage >= exécuteur).
    const targetedMessage = await message.channel.messages.fetch(args[1]).catch(console.error);
    if (!args[1] || !targetedMessage) return message.channel.send(discordError(this.config.invalidMessage, message));
    if (targetedMessage.member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(discordError(this.config.targetedUserTooPowerful, message));

    // On a tout ! On déplace le message dans le salon demandé en supprimant l'ancien (ainsi que celui de l'exécuteur de la commande).
    message.delete();
    targetedMessage.delete();
    const successMessage = this.config.successfullyMoved
      .replace('%a', targetedMessage.member.nickname || targetedMessage.author.username)
      .replace('%s', targetedChannel)
      .replace('%t', message.member.nickname || message.author.username);
    message.channel.send(discordInfo(successMessage, message));
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Message de ${targetedMessage.member.nickname || targetedMessage.author.username} :`, targetedMessage.author.avatarURL())
      .setDescription(targetedMessage.content)
      .setFooter(`Déplacé par ${message.member.nickname || message.author.username}`)
      .setTimestamp(targetedMessage.createdAt);
    const moveEmbed = await targetedChannel.send(embed);

    // On crée un collecteur afin de pouvoir supprimer le message (exécuteur de la command .move).
    const collector = moveEmbed
      .createReactionCollector((reaction, user) => user.id === message.author.id
        && reaction.emoji.name === '🗑️'
        && !user.bot)
      .on('collect', () => {
        moveEmbed.delete();
        collector.stop();
      });
  }
}

export default Move;
