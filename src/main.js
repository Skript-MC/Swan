/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import { loadBot, loadCommands, loadSkriptHubAPI, loadSkripttoolsAddons, loadSkripttoolsSkript, loadDatabases } from './setup';
import { success, error, discordError } from './helpers/messages';
import { uncapitalize, jkDistance } from './utils';
import generateDocs from '../docs/docs';


export const config = require('../config/config.json'); // eslint-disable-line global-require

export const commands = [];
export const sanctions = [];

loadCommands();
export const db = loadDatabases();
export const client = loadBot();
export const SkriptHubSyntaxes = loadSkriptHubAPI();
export const SkripttoolsAddons = loadSkripttoolsAddons();
export const SkripttoolsSkript = loadSkripttoolsSkript();

let generated = false;

client.on('ready', () => {
  client.user.setActivity(config.bot.activity_on, { type: 'WATCHING' });
  success('Skript-MC bot loaded!');
  if (!generated) {
    generated = true;
    generateDocs();
  }

  client.config = {};
  client.config.activated = true;

  setInterval(() => {
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

  // Command Manager
  const args = message.content.split(' ');
  let cmd = args.shift();

  if (cmd === config.bot.prefix
    || cmd.startsWith(`${config.bot.prefix}${config.bot.prefix}`)
    || (!client.config.activated && !['.status', '.statut'].includes(cmd))) return;


  // Empêche les MA de mettre des liens d'autres docs
  if (message.member.roles.cache.has(config.roles.ma) && (message.content.includes('docs.skunity.com') || message.content.includes('skripthub.net/docs/'))) {
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
  if (message.channel.id === config.channels.snippet && !message.member.roles.cache.has(r => r.id === config.roles.staff)) {
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
    await message.delete().catch(console.error);
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setTitle(`Suggestion de ${message.author.username} (${message.author.id})`, message.author.avatarURL)
      .setDescription(message.content)
      .setTimestamp();

    const msg = await message.channel.send(embed);
    msg.react('✅').then(() => msg.react('❌'));
  }

  if (cmd.startsWith(config.bot.prefix)) {
    cmd = cmd.substr(config.bot.prefix.length);

    for (const command of commands) {
      const aliases = [];
      for (const alias of command.aliases) aliases.push(alias.toLowerCase());

      if (aliases.includes(cmd.toLowerCase())) {
        if (canExecute(command, message)) { // eslint-disable-line no-use-before-define
          command.execute(message, args);
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
          if (canExecute(matches[index], message)) return matches[index].execute(message, args); // eslint-disable-line no-use-before-define
        });
      return;
    }

    const msg = await message.channel.send(discordError(config.messages.errors.unknowncommand, message));
    message.delete({ timeout: 5000 });
    msg.delete({ timeout: 5000 });
  }
});

client.on('messageReactionAdd', async (reaction, _user) => {
  if (reaction.message.channel.id === config.channels.suggestion) {
    const guild = client.guilds.cache.get(config.bot.guild);
    const link = `https://discordapp.com/channels/${guild.id}/${config.channels.suggestion}/${reaction.message.id}`;
    if (reaction.emoji.name === '✅') {
      const positive = reaction.count;
      if (positive === 20) {
        guild.channels.cache.get(config.channels.main).send(`:fire: La suggestion de ${reaction.message.embeds[0].title.replace(/Suggestion de (\w+) \(\d+\)/, '$1')} devient populaire ! Elle a déjà 20 avis positifs !\nAvez-vous pensé à y jeter un oeil ? Qu'en pensez-vous ?\nLien : ${link}`);
      }
    } else if (reaction.emoji.name === '❌') {
      const negative = reaction.count;
      if (negative === 10) {
        guild.channels.cache.get(config.channels.modMain).send(`:warning: La suggestion de ${reaction.message.embeds[0].title.replace(/Suggestion de (\w+) \(\d+\)/, '$1')} a reçu beaucoup de réactions négatives ! Elle a 10 avis contre.\nLien : ${link}`);
      }
    }
  }
});

client.on('error', console.error);
client.on('warn', console.warn);
client.on('disconnect', () => error('Bot deconnected...'));
client.on('reconnecting', () => error('Bot is reconnecting...'));

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
  if (config.bot.forbidden_channels.includes(message.channel.id)) return false;
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
