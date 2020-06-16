import { MessageEmbed, DMChannel } from 'discord.js';
import { client, db } from '../main';
import { jwDistance, uncapitalize } from '../utils';
import SanctionManager from '../structures/SanctionManager';

const linkRegex = new RegExp(`https://discord(?:app)?.com/channels/${client.config.bot.guild}/(\\d{18})/(\\d{18})`, 'gimu');

function canExecute(command, message) {
  // Les gérants ont toutes les permissions
  if (message.member.roles.cache.has(client.config.roles.owner)) return true;
  // Check des permissions
  if (command.permissions.length > 0) {
    for (const perm of command.permissions) {
      if (!message.member.roles.cache.find(role => role.name === perm)) {
        message.channel.sendError(client.config.messages.errors.permission, message.member);
        return false;
      }
    }
  }
  // Check du cooldown
  if (command.cooldown !== 0 && command.userCooldowns.has(message.author.id) && (command.userCooldowns.get(message.author.id) + command.cooldown >= Date.now())) {
    message.channel.sendError(client.config.messages.errors.cooldown, message.member);
    return false;
  }
  // Check des channels interdits pour toutes les commandes
  if (client.config.bot.forbiddenChannels.includes(message.channel.id)) return false;
  // Check des channels interdits par la commande
  if (command.prohibitedChannels.length > 0 && command.prohibitedChannels.includes(message.channel.id)) return false;
  // Check des channels requis par la commande (on autorise le channel #bot dans tous les cas)
  if (message.channel.id === client.config.channels.bot || (command.requiredChannels.length > 0 && !command.requiredChannels.includes(message.channel.id))) return false;
  // Check des channels d'aide
  if ((client.config.channels.helpSkript.includes(message.channel.id) || client.config.channels.helpOther.includes(message.channel.id)) && !command.enabledInHelpChannels) {
    message.channel.sendError(client.config.messages.errors.notInHelpChannels, message.member);
    return false;
  }
  return true;
}

export default async function messageHandler(message) {
  const { prefix } = client.config.bot;
  let cmd = message.content.split(' ').shift();
  // TODO: Améliorer ceci pour ne pas avoir a hardcoder les commandes...
  const splitOneSpace = ['code', 'balise'];
  const args = splitOneSpace.map(c => `${prefix}${c}`).includes(cmd)
    ? message.content.split(' ')
    : message.content.split(/ +/g);
  args.shift();

  if (message.author.bot
    || message.system
    || message.channel instanceof DMChannel
    || message.guild.id !== client.config.bot.guild
    || (!client.activated && ![`${prefix}status`, `${prefix}statut`].includes(cmd))) return;

  if (await SanctionManager.isBanned(message.author.id)) {
    SanctionManager.hasSentMessages(message.author.id);
    return;
  }
  // Easter egg "ssh root@skript-mc.fr"
  if (message.channel.id === client.config.channels.bot && message.content.startsWith('ssh root@skript-mc.fr')) {
    const guess = message.content.split(' ').pop();
    const password = await db.miscellaneous.findOne({ entry: 'sshpassword' }).catch(console.error);
    if (!password) {
      message.channel.send(':thinking: `Connect to host skript-mc.fr port 22: Connection timed out`');
    } else if (guess === password.value) {
      message.delete();
      message.channel.send(`:white_check_mark: \`Establishing the connection ...\`\n\`\`\`\n      _____ _         _       _          __  __  _____ \n     / ____| |       (_)     | |        |  \\/  |/ ____|\n    | (___ | | ___ __ _ _ __ | |_ ______| \\  / | |     \n     \\___ \\| |/ / '__| | '_ \\| __|______| |\\/| | |     \n     ____) |   <| |  | | |_) | |_       | |  | | |____ \n    |_____/|_|\\_\\_|  |_| .__/ \\__|      |_|  |_|\\_____|\n                       | |                             \n                       |_|\n\nLast login: ${message.author.username} at ${message.createdAt}.\nYou have mail.\nroot@skript-mc.fr:~#\`\`\``);
    } else {
      message.channel.send(':x: `Permission denied, please try again.`');
    }
    return;
  }


  const isCommand = cmd.startsWith(client.config.bot.prefix)
    && cmd !== client.config.bot.prefix
    && cmd.startsWith(`${client.config.bot.prefix}${client.config.bot.prefix}`);

  // Système de citation
  let text = message.content;
  if (!isCommand && message.content.match(linkRegex)) {
    const quotes = [];
    while (text.match(linkRegex)) {
      const [full, channelId, messageId] = linkRegex.exec(text);
      quotes.push({ channelId, messageId });
      text = text.replace(full, '');
    }

    for (const quote of quotes) {
      const channel = await client.channels.fetch(quote.channelId).catch(console.error);
      if (!channel) return;
      const targetedMessage = await channel.messages.fetch(quote.messageId).catch(console.error);
      if (!targetedMessage?.content) return;
      const embed = new MessageEmbed()
        .setColor(client.config.colors.default)
        .setAuthor(`Message de ${targetedMessage.member.displayName}`, targetedMessage.author.avatarURL())
        .setDescription(`${targetedMessage.content} [(lien)](https://discordapp.com/channels/${client.config.bot.guild}/${channel.id}/${targetedMessage.id})`)
        .setFooter(`Message cité par ${message.member.displayName}`)
        .setTimestamp(targetedMessage.createdAt);
      if (targetedMessage.attachments !== 0) {
        let loop = 1;
        if (loop <= 5) {
          targetedMessage.attachments.forEach((attachment) => {
            embed.addField(`Pièce jointe n°${loop}`, attachment.url);
            loop++;
          });
        }
      }
      const msg = await message.channel.send(embed);
      await msg.react('🗑️');
      const collector = msg
        .createReactionCollector((reaction, user) => user.id === message.author.id
          && reaction.emoji.name === '🗑️'
          && !user.bot)
        .on('collect', () => {
          msg.delete();
          collector.stop();
        });
    }
  }

  // Antispam channel Snippet
  if (message.channel.id === client.config.channels.snippet
    && !message.member.roles.cache.has(r => r.id === client.config.roles.staff)) {
    // On vérifie que ce ne soit pas lui qui ai posté le dernier message... Si jamais il dépasse les 2k charactères, qu'il veut apporter des précisions ou qu'il poste un autre snippet par exemple.
    const previousAuthorId = await message.channel.messages.fetch({ before: message.channel.lastMessageID, limit: 1 })
      .then(elt => elt.first().author.id);
    if (previousAuthorId !== message.author.id && !message.content.match(/```((.+|\n))*```/gimu)) {
      message.delete();
      message.member.send(client.config.messages.miscellaneous.noSpam);
      return;
    }
  }

  // Empêche les MA de mettre des liens d'autres docs
  if (message.member.roles.cache.has(client.config.roles.ma)
    && (message.content.includes('docs.skunity.com')
    || message.content.includes('skripthub.net/docs/'))) {
    message.delete();
    message.author.send(client.config.messages.miscellaneous.noDocLink);
  }

  // Channel "idée" : on ajoute les réactions
  if (message.channel.id === client.config.channels.idea) {
    message.react('✅').then(() => message.react('❌'));
  }

  // Channel "vos-suggestions" : on créé l'embed et ajoute les réactions
  if (message.channel.id === client.config.channels.suggestion) {
    await message.delete().catch(console.error);
    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .setTitle(`Suggestion de ${message.author.username} (${message.author.id})`, message.author.avatarURL())
      .setDescription(message.content)
      .setTimestamp();

    const msg = await message.channel.send(embed);
    msg.react('✅').then(() => msg.react('❌'));
  }

  if (cmd === client.config.bot.prefix
    || cmd.startsWith(`${client.config.bot.prefix}${client.config.bot.prefix}`)) return;

  if (cmd.startsWith(client.config.bot.prefix)) {
    cmd = cmd.substr(client.config.bot.prefix.length);

    for (const command of client.commands) {
      const aliases = [];
      for (const alias of command.aliases) aliases.push(alias.toLowerCase());

      if (aliases.includes(cmd.toLowerCase())) {
        if (canExecute(command, message)) {
          command.execute(client, message, args);
          db.commandsStats.update({ command: command.name }, { $inc: { used: 1 } }, { upsert: true }).catch(console.error);
          if (command.cooldown !== 0) command.userCooldowns.set(message.author.id, Date.now());
        }
        return;
      }
    }

    const matches = [];
    for (const elt of client.commands) {
      for (const alias of elt.aliases) {
        if (jwDistance(cmd, alias) >= client.config.miscellaneous.commandSimilarity) {
          matches.push(elt);
          break;
        }
      }
    }

    if (matches.length !== 0) {
      const cmdList = matches.map(m => uncapitalize(m.name.replace(/ /g, ''))).join('`, `.');
      const msg = await message.channel.send(client.config.messages.miscellaneous.cmdSuggestion.replace('%c', cmd).replace('%m', cmdList));

      const reactions = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
      if (matches.length === 1) msg.react('✅');
      else for (let i = 0; i < reactions.length && i < matches.length; i++) await msg.react(reactions[i]);

      const collector = msg
        .createReactionCollector((reaction, user) => !user.bot
            && user.id === message.author.id
            && (reaction.emoji.name === '✅' || reactions.includes(reaction.emoji.name)))
        .once('collect', (reaction) => {
          collector.stop();
          msg.delete();
          const index = reaction.emoji.name === '✅' ? 0 : reactions.indexOf(reaction.emoji.name);
          const command = matches[index];
          if (canExecute(command, message)) {
            message.createdTimestamp = Date.now(); // eslint-disable-line no-param-reassign
            command.execute(client, message, args);
            db.commandsStats.update({ command: command.name }, { $inc: { used: 1 } }, { upsert: true }).catch(console.error);
            if (command.cooldown !== 0) command.userCooldowns.set(message.author.id, Date.now());
          }
        });
      return;
    }

    const msg = await message.channel.sendError(client.config.messages.errors.unknowncommand, message.member);
    message.delete({ timeout: 5000 });
    msg.delete({ timeout: 5000 });
  }
}
