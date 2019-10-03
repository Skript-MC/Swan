/* eslint-disable consistent-return */
/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import { loadBot, loadCommands, loadSkripttoolsAddons, loadSkripttoolsSkript, loadDatabases } from './setup';
import { success, error, discordError } from './components/Messages';
import { removeSanction, isBan, hardBan } from './components/Moderation';
import { findMatches, uncapitalize } from './utils';
import generateDocs from '../docs/docs';

export const config = require('../config/config.json'); // eslint-disable-line global-require

export const client = loadBot();
export const SkripttoolsAddons = loadSkripttoolsAddons();
export const SkripttoolsSkript = loadSkripttoolsSkript();

export const db = loadDatabases();

export const commands = [];
export const sanctions = [];

(() => {
  loadCommands();

  client.on('ready', () => {
    client.user.setActivity(config.bot.activity, { type: 'WATCHING' });
    success('Skript-MC bot loaded!');
    generateDocs();

    const guild = client.guilds.get(config.bot.guild);
    setInterval(() => {
      /* --- Sanctions --- */
      // Trouver tous les élements dont la propriété "finish" est inférieure ($lt) à maintenant et ($and) pas égale ($not) à -1 (=ban def)
      const query = {
        $and: [{
          finish: { $lt: Date.now() },
        }, {
          $not: { finish: -1 },
        }],
      };
      db.sanctions.find(query, (err, results) => {
        if (err) console.error(err);
        if (!guild) {
          console.error('Aucune guilde n\'a été spécifiée dans le config.json. Il est donc impossible de vérifier si des sanctions ont expirées.');
        } else {
          for (const result of results) {
            removeSanction({
              member: guild.members.get(result.member),
              title: 'Action automatique',
              mod: client.user,
              sanction: result.sanction,
              reason: 'Sanction expirée (automatique).',
              id: result._id,
            }, guild);
          }
        }
      });

      /* --- Tri dans les cooldowns des commandes --- */
      for (const cmd of commands) {
        for (const [id, lastuse] of cmd.userCooldowns) {
          if (lastuse + cmd.cooldown >= Date.now()) cmd.userCooldowns.delete(id);
        }
      }
    }, config.bot.checkInterval);
  });

  client.on('message', async (message) => {
    if (message.author.bot || message.system || message.guild.id !== config.bot.guild) return;

    // Empêche les MA de mettre des liens d'autres docs
    if (message.member.roles.has(config.roles.ma) && (message.content.includes('docs.skunity.com') || message.content.includes('skripthub.net/docs/'))) {
      message.delete();
      const embed = new MessageEmbed()
        .setColor('AQUA')
        .setDescription(config.messages.miscellaneous.noDocLink);
      message.author.send(embed);
    }

    // Channel "idée" : on ajoute les réactions
    if (message.channel.id === config.channels.idea) {
      message.react('✅').then(() => message.react('❌'));
    }

    // Antispam channel Snippet
    if (message.channel.id === config.channels.snippet && !message.member.roles.has(r => r.id === config.roles.staff)) {
      // On vérifie que ce ne soit pas lui qui ai posté le dernier message... Si jamais il dépasse les 2k charactères, qu'il veut apporter des précisions ou qu'il poste un autre snippet par exemple.
      const previousAuthorId = await message.channel.messages.fetch({ before: message.channel.lastMessageID, limit: 1 })
        .then(elt => elt.first().author.id);
      if (previousAuthorId !== message.author.id && !message.content.match(/```((.+|\n))*```/gimu)) {
        message.delete();
        message.member.send(config.messages.miscellaneous.noSpam);
      }
    }

    // Channel "vos-suggestions" : on créé l'embed et ajoute les réactions
    if (message.channel.id === config.channels.suggestion) {
      message.delete();
      const embed = new MessageEmbed()
        .setColor(config.colors.default)
        .setAuthor(`Suggestion de ${message.author.username} (${message.author.id})`, message.author.avatarURL)
        .setDescription(message.content)
        .setTimestamp();

      const msg = await message.channel.send(embed);
      msg.react('✅').then(() => msg.react('❌'));
    }

    // Command Manager
    const args = message.content.split(' ');
    let cmd = args.shift();

    if (cmd === config.bot.prefix || cmd.startsWith(`${config.bot.prefix}${config.bot.prefix}`)) return;

    if (cmd.startsWith(config.bot.prefix)) {
      cmd = cmd.substr(1);
      for (const command of commands) {
        if (command.aliases.includes(cmd)) {
          if (canExecute(command, message)) { // eslint-disable-line no-use-before-define
            command.execute(message, args);
            if (command.cooldown !== 0) command.userCooldowns.set(message.author.id, Date.now());
          }
          return;
        }
      }

      // Si la commande est inconnue
      const matches = findMatches(cmd);
      if (matches.length !== 0) {
        const msg = await message.channel.send(config.messages.miscellaneous.cmdSuggestion.replace('%c', cmd).replace('%m', matches.map(m => uncapitalize(m.name.replace(/ /g, ''))).join('`, `.')));

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
            if (canExecute(matches[index], message)) return matches[index].execute(message, args); // eslint-disable-line no-use-before-define
          });
        return;
      }

      const msg = await message.channel.send(discordError(config.messages.errors.unknowncommand, message));
      message.delete({ timeout: 5000 });
      msg.delete({ timeout: 5000 });
    }
  });

  client.on('guildMemberRemove', async (member) => {
    if (await isBan(member.id)) hardBan(member, true);
  });

  client.on('error', err => console.error(err));
  client.on('warn', warning => console.warn(warning));
  client.on('disconnect', () => error('Bot deconnected !'));
  client.on('reconnecting', () => error('Bot is reconnecting...'));
})();

process.on('unhandledRejection', err => console.error(`Uncaught Promise Error:\n${err.stack}`));

function canExecute(command, message) {
  // Les gérants ont toutes les permissions
  if (message.member.roles.has(config.roles.owner)) return true;
  // Check des permissions
  if (command.permissions.length > 0) {
    for (const perm of command.permissions) {
      if (!message.member.roles.find(role => role.name === perm)) {
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
  if (config.bot.forbidden_channels.includes(message.channel.id)) return false;
  // Check des channels interdits par la commande
  if (command.prohibitedChannels.length > 0 && command.prohibitedChannels.includes(message.channel.id)) return false;
  // Check des channels requis par la commande
  if (command.requiredChannels.length > 0 && !command.requiredChannels.includes(message.channel.id)) return false;
  // Check des channels d'aide
  if ((config.channels.helpSkript.includes(message.channel.id) || config.channels.helpOther.includes(message.channel.id)) && !command.activeInHelpChannels) {
    message.channel.send(discordError(config.messages.errors.notInHelpChannels, message));
    return false;
  }
  return true;
}
