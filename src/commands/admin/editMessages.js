import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { db } from '../../main';

class EditMessages extends Command {
  constructor() {
    super('Edit Messages');
    this.aliases = ['editm', 'editmsg', 'editMessages', 'msg'];
    this.usage = 'msg <error|auto> [<new|delete <titre>>]';
    this.examples = ['msg error new'];
    this.permissions = ['Membre actif'];
  }

  async execute(client, message, args) {
    if (!args[0]) return message.channel.sendError(this.config.invalidCommand, message.member);
    const type = args[0].toLowerCase();
    // Vérification des arguments ('error' ou 'auto')
    if (!['error', 'auto'].includes(type)) return message.channel.sendError(this.config.invalidCommand, message.member);

    // On récupère la db une seule fois pour le reste du code
    const msgDocs = await db.messages.find({ type }).catch(console.error);

    // On affiche la liste des messages si on ne veut pas en créer un nouveau
    if (args[1] === 'new') {
      const embedCollector = new MessageEmbed()
        .setTitle(this.config.howToAdd.title)
        .setDescription(this.config.howToAdd.content)
        .setColor(client.config.colors.default)
        .setFooter(`Exécuté par ${message.member.displayName}`)
        .setTimestamp();

      // On envoie l'embed d'information et on démarre le collector
      const collectionMsg = await message.channel.send(embedCollector);
      const msgCollector = message.channel.createMessageCollector(msg => msg.author.id === message.author.id
        && msg.channel.id === message.channel.id, { time: 60000 });
      const answers = [];

      // Collecteur de réponse
      msgCollector.on('collect', (answer) => {
        if (answers.length === 0) {
          const title = answer.content.split(' ')[0].toLowerCase();
          if (msgDocs.some(msg => msg.type === type && msg.title === title)) return answer.react('❌');
          // Uniquement si la condition est validée, on ajoute la réponse à l'array des réponses
          answers.push(title);
          // On réagit pour indiquer qu'on a bien pris en compte sa réponse
          answer.react('✅');
        } else if (answers.length === 1) {
          const aliases = answer.content.split('|');
          for (const aliase of aliases) {
            if (msgDocs.some(msg => msg.type === type && msg.aliases.includes(aliase))) {
              return answer.react('❌');
            }
          }
          answers.push(answer.content);
          answer.react('✅');
        } else if (answers.length === 2) {
          answers.push(answer.content);
          answer.react('✅');
          msgCollector.stop();
        }
      });

      // Quand le collecteur s'arrêtera
      msgCollector.on('end', () => {
        msgCollector.stop();
        // Si on a pas nos 3 réponses (quoi qu'il en est de la raison), on indique que la collection est stoppée et rien n'est sauvegardé
        if (answers.length !== 3) return message.channel.sendError(this.config.endCollect, message.member);
        // On traite nos réponses
        const title = answers[0];
        const aliases = answers[1].toLowerCase().split('|');
        // On indique le type (soit 'error' ou 'auto') et son contenu etc...
        db.messages.insert({ type, title, aliases, content: answers[2] }).catch(console.error);
        message.channel.sendSuccess(`Votre message a bien été ajouté à la base de données \`${type}\`. Vous pouvez passer en revue les détails de votre ajout :\n\n> **Sujet du message :** ${title}\n\n> **Alias :** ${aliases.join(', ')}\n\n> **Contenu :** ${answers[2]}\n\nExécutez \`.msg ${type} del ${title}\` si vous vous souhaitez le supprimer.`, message.member);
      });

      // On ajoute une réaction pour stopper la collection de messages
      await collectionMsg.react('🛑');
      const reactionCollector = collectionMsg
        .createReactionCollector((reaction, user) => user.id === message.author.id
          && !user.bot
          && reaction.emoji.name === '🛑')
        .once('collect', () => {
          reactionCollector.stop();
          msgCollector.stop();
        });
    } else if (['del', 'delete', 'rem', 'remove'].includes(args[1])) {
      if (!args[2]) return message.channel.sendError(this.config.invalidDeleteCommand, message.member);
      if (msgDocs.some(msg => msg.type === type && msg.title === args[2])) {
        await db.messages.remove({ type, title: args[2] }).catch(console.error);
        return message.channel.sendSuccess(this.config.successDelete, message.member);
      }
      return message.channel.sendError(this.config.messageNotFound, message.member);
    } else {
      let content = '';
      for (const msg of msgDocs) {
        content += `- **${msg.title}** (${msg.aliases.join(', ')})\n`;
      }
      content += `\nExécutez \`.msg ${type} new\` pour ajouter un message.`;

      const embed = new MessageEmbed()
        .setColor(client.config.colors.default)
        .setAuthor(`Liste des messages (${type})`, 'attachment://logo.png')
        .setDescription(content || this.config.noData)
        .setFooter(`Exécuté par ${message.author.username}`)
        .setTimestamp();
      message.channel.send(embed);
    }
  }
}

export default EditMessages;
