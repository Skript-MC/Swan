import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { config } from '../../main';

class Move extends Command {
  constructor() {
    super('Move Message');
    this.aliases = ['move', 'MoveMessage'];
    this.usage = 'move <#mention salon> <ID message>';
    this.examples = ['move #skript-2 687032391075889161'];
    this.permissions = ['Membre actif'];
    this.enabledInHelpChannels = true;
  }

  async execute(message, args) {
    // On récupère le salon, vérifie qu'il existe, qu'il est autorisé et qu'il n'est pas le même avant de faire une requête à l'API Discord.
    const targetedChannel = message.mentions.channels.first();
    if (!args[0] || !targetedChannel) return message.channel.sendError(this.config.invalidChannel, message.member);
    if (targetedChannel.id === message.channel.id) return message.channel.sendError(this.config.sameChannel, message.member);
    const helpChannels = [
      ...config.channels.helpSkript,
      ...config.channels.helpOther,
    ];
    if (!helpChannels.includes(message.channel.id) || !helpChannels.includes(targetedChannel.id)) return message.channel.sendError(this.config.restrictedChannel, message.member);

    // C'est bon ! On envoie la requête à l'API Discord et on vérifie s'il renvoie un message existant.
    // On vérifie ensuite si le déplacement n'est pas trop puissant (rôle targetedMessage >= exécuteur).
    const targetedMessage = await message.channel.messages.fetch(args[1]).catch(console.error);
    if (!args[1] || !targetedMessage) return message.channel.sendError(this.config.invalidMessage, message.member);
    if (targetedMessage.member.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.targetedUserTooPowerful, message.member);

    // On a tout ! On déplace le message dans le salon demandé en supprimant l'ancien (ainsi que celui de l'exécuteur de la commande).
    message.delete();
    targetedMessage.delete();
    const successMessage = this.config.successfullyMoved
      .replace('%a', targetedMessage.member.displayName)
      .replace('%s', targetedChannel)
      .replace('%t', message.member.displayName);
    message.channel.send(successMessage);
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Message de ${targetedMessage.member.displayName} :`, targetedMessage.author.avatarURL())
      .setDescription(targetedMessage.content)
      .setFooter(`Déplacé par ${message.member.displayName}`)
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
