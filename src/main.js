/* eslint-disable consistent-return */
/* eslint-disable no-loop-func */
/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable import/no-cycle */
import Datastore from 'nedb';
import { RichEmbed } from 'discord.js';
import { loadBot, loadCommands, loadSkripttoolsAddons, loadSkripttoolsSkript } from './setup';
import { success, discordError } from './components/Messages';
import { removeSanction, isBan, hardBan } from './components/Moderation';

export const config = require('../config/config.json');

export const client = loadBot();
export const SkripttoolsAddons = loadSkripttoolsAddons();
export const SkripttoolsSkript = loadSkripttoolsSkript();

export const sanctionDb = new Datastore('sanctions.db');
sanctionDb.loadDatabase((err) => {
  if (err) {
    console.warn("Impossible de charger la BDD 'sanctions.db' :");
    return console.error(err);
  }
  return success('Database "Sanctions" loaded!');
});

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
      sanctionDb.find(query, (err, results) => {
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
    if (message.member.roles.has('269479421998530561') && (message.content.includes('docs.skunity.com') || message.content.includes('skripthub.net/docs/'))) {
      message.delete();
      const embed = new RichEmbed()
        .setColor('AQUA')
        .setDescription('Petit Membre Actif:\n\nTu sembles manquer de neurones, pas de lien Skunity ou SkriptHub. Tu bouges ton cul et tu modifies la Doc SkriptMC si il manque quelque chose. Si tu as pas les perms, tu les demandes à Vengelis ou Rémi');
      message.author.send(embed);
    }

    // Channel "idée" : on ajoute les réactions
    if (message.channel.id === config.channels.idea) {
      message.react('✅').then(() => message.react('❌'));
    }

    // Antispam channel Snippet
    if (message.channel.id === config.channels.snippet && !message.member.roles.find(r => r.name === 'Staff')) {
      // On vérifie que ce ne soit pas lui qui ai posté le dernier message... Si jamais il dépasse les 2k charactères, qu'il veut apporter des précisions ou qu'il poste un autre snippet par exemple.
      const previousAuthorId = await message.channel.fetchMessages({ before: message.channel.lastMessageID, limit: 1 })
        .then(elt => elt.first().author.id);
      if (previousAuthorId !== message.author.id && !message.content.match(/```(?:(?:.+|\n))*```/gimu)) {
        message.delete();
        message.member.send(`Merci d'éviter le spam dans ${message.channel}. Votre message ne contient pas de blocs de code... Comment voulez vous partager du code sans bloc de code ?? Si vous ne savez simplement pas faire de bloc de codes, regardez ici : <https://support.discordapp.com/hc/fr/articles/210298617>`);
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
        if (config.bot.forbidden_channels.includes(message.channel.id)) return;

        if (command.permissions.length > 0) {
          let hasPerm;
          for (const perm of command.permissions) {
            if (message.member.roles.find(role => role.name === perm)) hasPerm = true;
            if (!hasPerm) return discordError(config.messages.errors.permission, message);
          }
        }

        if (command.requiredChannels.length > 0
          && !command.requiredChannels.includes(message.channel.id)) return;

        if (command.prohibitedChannels.length > 0
          && command.prohibitedChannels.includes(message.channel.id)) return;

        command.execute(message, args);
      }
    }
  });

  client.on('guildMemberRemove', async (member) => {
    if (await isBan(member.id)) hardBan(member, true);
  });

  client.on('error', error => console.error(error));
})();
