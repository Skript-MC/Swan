/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import { client, config, commands, db } from '../main';
import { jkDistance, uncapitalize } from '../utils';
import { discordError } from '../structures/messages';
import CreditsManager from '../structures/CreditsManager';

function canExecute(command, message) {
  // Les gérants ont toutes les permissions
  if (message.member.roles.cache.has(config.roles.owner)) return true;
  // Check des permissions
  if (command.permissions.length > 0) {
    for (const perm of command.permissions) {
      if (!message.member.roles.cache.find(role => role.name === perm)) {
        message.channel.send(discordError(config.messages.errors.permission, message));
        return false;
      }
    }
  }
  // Check du cooldown
  if (command.cooldown !== 0 && command.userCooldowns.has(message.author.id) && (command.userCooldowns.get(message.author.id) + command.cooldown >= Date.now())) {
    message.channel.send(discordError(config.messages.errors.cooldown, message));
    return false;
  }
  // Check des channels interdits pour toutes les commandes
  if (config.bot.forbiddenChannels.includes(message.channel.id)) return false;
  // Check des channels interdits par la commande
  if (command.prohibitedChannels.length > 0 && command.prohibitedChannels.includes(message.channel.id)) return false;
  // Check des channels requis par la commande
  if (command.requiredChannels.length > 0 && !command.requiredChannels.includes(message.channel.id)) return false;
  // Check des channels d'aide
  if ((config.channels.helpSkript.includes(message.channel.id) || config.channels.helpOther.includes(message.channel.id)) && !command.enabledInHelpChannels) {
    message.channel.send(discordError(config.messages.errors.notInHelpChannels, message));
    return false;
  }
  return true;
}

export default async function messageHandler(message) {
  const args = message.content.split(' ');
  let cmd = args.shift();

  if (message.author.bot
    || message.system
    || message.guild.id !== config.bot.guild
    || (!client.config.activated && !['.status', '.statut'].includes(cmd))) return;

  // Antispam channel Snippet
  if (message.channel.id === config.channels.snippet
    && !message.member.roles.cache.has(r => r.id === config.roles.staff)) {
    // On vérifie que ce ne soit pas lui qui ai posté le dernier message... Si jamais il dépasse les 2k charactères, qu'il veut apporter des précisions ou qu'il poste un autre snippet par exemple.
    const previousAuthorId = await message.channel.messages.fetch({ before: message.channel.lastMessageID, limit: 1 })
      .then(elt => elt.first().author.id);
    if (previousAuthorId !== message.author.id && !message.content.match(/```((.+|\n))*```/gimu)) {
      message.delete();
      message.member.send(config.messages.miscellaneous.noSpam);
      return;
    }
  }

  // On ajoute les crédits (après l'antispam #snippets)
  if (message.channel.id !== config.channels.bot && !cmd.startsWith(config.bot.prefix)) {
    let value = config.credits.sendMessageOther;
    if (message.channel.id === config.channels.snippet) value = config.credits.sendSnippet;
    if (message.channel.id === config.channels.idea) value = config.credits.sendIdea;
    if (message.channel.id === config.channels.suggestion) value = config.credits.sendSuggestion;
    if (config.channels.helpSkript.includes(message.channel.id)
      || config.channels.helpOther.includes(message.channel.id)) value = config.credits.sendInHelp;

    if (message.member.roles.cache.has(config.roles.nitrobooster)) value *= config.credits.bonuses.nitroBooster;
    if (message.cleanContent.match(/```(.|\s|\t)*```/gimu)) value += config.credits.bonuses.containsCode;
    value += Math.round(message.content.length / 100);

    CreditsManager.addToMember(message.member, value);
  }

  // Empêche les MA de mettre des liens d'autres docs
  if (message.member.roles.cache.has(config.roles.ma)
    && (message.content.includes('docs.skunity.com')
    || message.content.includes('skripthub.net/docs/'))) {
    message.delete();
    message.author.send(config.messages.miscellaneous.noDocLink);
  }

  // Channel "idée" : on ajoute les réactions
  if (message.channel.id === config.channels.idea) {
    message.react('✅').then(() => message.react('❌'));
  }

  // Channel "vos-suggestions" : on créé l'embed et ajoute les réactions
  if (message.channel.id === config.channels.suggestion) {
    await message.delete().catch(console.error);
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setTitle(`Suggestion de ${message.author.username} (${message.author.id})`, message.author.avatarURL)
      .setDescription(message.content)
      .setTimestamp();

    const msg = await message.channel.send(embed);
    msg.react('✅').then(() => msg.react('❌'));
  }

  if (cmd === config.bot.prefix
    || cmd.startsWith(`${config.bot.prefix}${config.bot.prefix}`)) return;

  if (cmd.startsWith(config.bot.prefix)) {
    cmd = cmd.substr(config.bot.prefix.length);

    for (const command of commands) {
      const aliases = [];
      for (const alias of command.aliases) aliases.push(alias.toLowerCase());

      if (aliases.includes(cmd.toLowerCase())) {
        if (canExecute(command, message)) {
          command.execute(message, args);
          await db.commandsStats.update({ command: command.name }, { $inc: { used: 1 } }, { upsert: true }).catch(console.error);
          if (command.cooldown !== 0) command.userCooldowns.set(message.author.id, Date.now());
        }
        return;
      }
    }

    const matches = [];
    for (const elt of commands) {
      for (const alias of elt.aliases) {
        if (jkDistance(cmd, alias) >= config.miscellaneous.commandSimilarity) {
          matches.push(elt);
          break;
        }
      }
    }

    if (matches.length !== 0) {
      const cmdList = matches.map(m => uncapitalize(m.name.replace(/ /g, ''))).join('`, `.');
      const msg = await message.channel.send(config.messages.miscellaneous.cmdSuggestion.replace('%c', cmd).replace('%m', cmdList));

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
          if (canExecute(matches[index], message)) return matches[index].execute(message, args);
        });
      return;
    }

    const msg = await message.channel.send(discordError(config.messages.errors.unknowncommand, message));
    message.delete({ timeout: 5000 });
    msg.delete({ timeout: 5000 });
  }
}
