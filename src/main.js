/* eslint-disable consistent-return */
/* eslint-disable no-loop-func */
/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable import/no-cycle */
import { RichEmbed } from 'discord.js';
import { loadBot, loadCommands, loadSkripttoolsAddons, loadSkripttoolsSkript, loadDatabases } from './setup';
import { success, discordError } from './components/Messages';
import { removeSanction, isBan, hardBan } from './components/Moderation';

export const config = require('../config/config.json');

export const client = loadBot();
export const SkripttoolsAddons = loadSkripttoolsAddons();
export const SkripttoolsSkript = loadSkripttoolsSkript();

export const db = loadDatabases();

export const commands = [];
export const sanctions = [];

(() => {
  loadCommands();

  client.on('ready', () => {
    client.user.setActivity('.aide | Skript-MC', { type: 'WATCHING' });
    success('Skript-MC bot loaded!');

    // Sanctions automatiques
    const guild = client.guilds.get(config.bot.guild);
    setInterval(() => {
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
      });
    }, 10000);
  });

  client.on('message', async (message) => {
    if (message.author.bot || message.system) return;

    // Empêche les MA de mettre des liens d'autres docs
    if (message.member.roles.has(config.roles.ma) && (message.content.includes('docs.skunity.com') || message.content.includes('skripthub.net/docs/'))) {
      message.delete();
      const embed = new RichEmbed()
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
      const previousAuthorId = await message.channel.fetchMessages({ before: message.channel.lastMessageID, limit: 1 })
        .then(elt => elt.first().author.id);
      if (previousAuthorId !== message.author.id && !message.content.match(/```(?:(?:.+|\n))*```/gimu)) {
        message.delete();
        message.member.send(config.messages.miscellaneous.noSpam);
      }
    }

    if (message.channel.id === config.channels.suggestion) {
      message.delete();
      const embed = new RichEmbed()
        .setColor(config.colors.default)
        .setAuthor(`Suggestion de ${message.author.username} (${message.author.id})`, message.author.avatarURL)
        .setDescription(message.content)
        .setTimestamp();

      const msg = await message.channel.send(embed);
      msg.react('589578480371367947');
      msg.react('589578504220180481');
    }

    const args = message.content.split(' ');
    const cmd = args.shift();

    for (const command of commands) {
      const regex = new RegExp(`^\\${config.bot.prefix}${command.regex.source}`, command.regex.flags);
      if (cmd.match(regex)) {
        // Check des channels interdits pour toutes les commandes
        if (config.bot.forbidden_channels.includes(message.channel.id)) return;

        // Check des channels interdits par la commande
        if (command.prohibitedChannels.length > 0
          && command.prohibitedChannels.includes(message.channel.id)) return;

        // Check des channels requis par la commande
        if (command.requiredChannels.length > 0
          && !command.requiredChannels.includes(message.channel.id)) return;

        // Check des permissions
        if (command.permissions.length > 0) {
          let hasPerm;
          for (const perm of command.permissions) {
            if (message.member.roles.find(role => role.name === perm)) hasPerm = true;
            if (!hasPerm) return discordError(config.messages.errors.permission, message);
          }
        }

        // Si tous les checks sont passés
        return command.execute(message, args);
      }
    }
    // Si la commande est inconnue
    discordError(config.messages.errors.unknowncommand, message);
  });

  client.on('guildMemberRemove', async (member) => {
    if (await isBan(member.id)) hardBan(member, true);
  });

  client.on('error', error => console.error(error));
})();
