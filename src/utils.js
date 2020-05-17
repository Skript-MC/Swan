/* eslint-disable no-param-reassign */
import crypto from 'crypto';
import moment from 'moment';

const math = require('mathjs');

export function padNumber(x) {
  return (x.toString().length < 2 ? `0${x}` : x).toString();
}

export function uncapitalize(string) {
  return string[0].toLowerCase() + string.slice(1);
}

export function toDuration(ms) {
  return ms === -1 ? 'Définitif' : moment.duration(ms).humanize();
}

export function extractQuotedText(text) {
  const result = [];
  const regex = /"([^"]*)"/gimu;
  let match = regex.exec(text);
  while (match) {
    result.push(match[1]);
    match = regex.exec(text);
  }
  return result;
}

/**
 * a = année, mo = mois, sem = semaine, j = jour, h = heure, m = minute, s = seconde
 * Note : Le code n'est pas case sensitive (pas de différence entre minuscule et majuscule)
 *
 * @example
 * import { toTimestamp } from '../../utils'
 * const votrevar = toTimestamp('3j5h15m'); // -> 278100
 */
export function toTimestamp(str) {
  str = String(str);

  const regexes = new Map();
  regexes.set(/a/i, 29030400);
  regexes.set(/mo/i, 2419200);
  regexes.set(/sem/i, 604800);
  regexes.set(/j/i, 86400);
  regexes.set(/h/i, 3600);
  regexes.set(/min/i, 60);
  regexes.set(/m/i, 60);
  regexes.set(/s/i, 1);

  str.replace(/\s*/g, '');
  for (const [regex, value] of regexes) {
    str = str.replace(regex, `*${value}+`);
  }

  // On regarde s'il reste des lettres
  if (str.match(/[a-zA-Z]+/g)) return null;

  try {
    return math.evaluate(str.slice(0, -1));
  } catch (e) {
    return null;
  }
}

export function parsePage(page, max = Infinity) {
  page = parseInt(page, 10) - 1;
  if (isNaN(page)) page = 0;
  else if (page < 0) page = 0;
  else if (page >= max) page = max - 1;
  return page;
}

/**
 * Renvoie un string alphanumérique aléatoire de la longueur `len`.
 * Il y a une très petite chance (moins de 1/1 000 000) que la taille soit plus petite que len
 * à cause de la conversion en base64, mais ce n'est pas un problème ici.
 * La probabilité de collision est très très petite (avec len = 16, il faudrait
 * 3*10^12  utilisations pour avoir 1 chance sur 1 million d'avoir 2 doublons)
 * Voir http://en.wikipedia.org/wiki/Birthday_problem
 * C'est l'algorithme d'id utilisé par NeDB.
 */
export function uid(len = 8) {
  return crypto.randomBytes(Math.ceil(Math.max(8, len * 2)))
    .toString('base64')
    .replace(/[+/]/g, '')
    .slice(0, len);
}

/**
 * @description Élaguer le pseudo d'un membre, pour qu'il puisse être utilisé dans le nom d'un channel textuel.
 * @param {GuildMember} member Le membre
 */
export function prunePseudo(member) {
  const name = member.displayName;
  let cleanPseudo = name.replace(/[^a-zA-Z0-9]/gimu, '');
  if (cleanPseudo.length === 0) cleanPseudo = member.id;
  return cleanPseudo.toLowerCase();
}

/**
 * @description Fonction pour calculer la distance jaro-winkler entre 2 strings
 * @param {String} s1 Premier string
 * @param {String} s2 Second string
 * @returns {Number} Nombre entre 0 et 1, qui est la distance JK entre les 2 textes
 */
export function jkDistance(s1, s2) {
  s1 = s1.toUpperCase();
  s2 = s2.toUpperCase();
  if (s1.length === 0 || s2.length === 0) return 0; // Si une des 2 strings est vide
  if (s1 === s2) return 1; // Si les 2 strings sont égaux

  // Compter les matchs
  let m = 0;
  const range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
  const s1Matches = new Array(s1.length);
  const s2Matches = new Array(s2.length);

  for (let i = 0; i < s1.length; i++) {
    const low = i >= range ? i - range : 0;
    const high = i + range <= (s2.length - 1) ? i + range : s2.length - 1;
    for (let j = low; j <= high; j++) {
      if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
        ++m;
        s1Matches[i] = true;
        s2Matches[j] = true;
        break;
      }
    }
  }

  if (m === 0) return 0; // Si aucun match n'est trouvé

  // Compter les transpositions
  let k = 0;
  let numTrans = 0;

  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i] === true) {
      let j;
      for (j = k; j < s2.length; j++) {
        if (s2Matches[j] === true) {
          k = j + 1;
          break;
        }
      }

      if (s1[i] !== s2[j]) ++numTrans;
    }
  }

  let weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
  let l = 0;

  if (weight > 0.7) {
    while (s1[l] === s2[l] && l < 4) ++l;
    weight += l * 0.1 * (1 - weight);
  }

  return weight;
}

export function toValidName(str) {
  const valid = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (['é', 'è', 'à', 'ù', 'ô', 'â', 'ê', 'ë', 'î', 'ï'].includes(char.toLowerCase())) {
      valid.push(char);
      continue;
    }
    const charcode = str.charCodeAt(i);
    if (charcode < 0x80) valid.push(char);
  }
  return valid.join('');
}

export function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function convertFileSize(size) {
  size = Math.abs(parseInt(size, 10));
  const def = [[1, 'octets'], [1024, 'ko'], [1024 ** 2, 'Mo'], [1024 ** 3, 'Go'], [1024 ** 4, 'To']];

  for (let i = 1; i < def.length; i++) {
    if (size < def[i][0]) return `${(size / def[i - 1][0]).toFixed(2)} ${def[i - 1][1]}`;
  }
}

/**
 * Create a "selector message", which will send a message from which the user can choose multiple options
 * @param {Client} client - The client
 * @param {Array} results - The array we should itterate
 * @param {string} query - The query the user passed (basically a args.join(' '))
 * @param {Message} message - The user's message
 * @param {Object} cmdConfig - The config of the command (basically this.config)
 * @param {Function} messageCallback - The callback to print a line
 * @param {Function} callback - The callback to call when the user has made his choice
 */
export async function selectorMessage(client, results, query, message, cmdConfig, messageCallback, callback) {
  const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
  let content = cmdConfig.searchResults.replace('%r', results.length).replace('%s', query);

  const elementNumber = results.length > 10 ? 10 : results.length;
  for (let i = 0; i < elementNumber; i++) content += `\n${reactionsNumbers[i]} ${messageCallback(results[i])}`;

  if (results.length - 10 > 0) content += `\n...et ${results.length - 10} de plus...`;
  const botMessage = await message.channel.send(content);

  for (let i = 0; i < elementNumber; i++) await botMessage.react(reactionsNumbers[i]);
  await botMessage.react('❌');

  const collectorNumbers = botMessage
    .createReactionCollector((reaction, user) => !user.bot
      && user.id === message.author.id
      && reactionsNumbers.includes(reaction.emoji.name))
    .once('collect', (reaction) => {
      botMessage.delete();
      callback(client.config, message, results[reactionsNumbers.indexOf(reaction.emoji.name)], cmdConfig);
      collectorNumbers.stop();
    });

  const collectorStop = botMessage
    .createReactionCollector((reaction, user) => !user.bot
      && user.id === message.author.id
      && reaction.emoji.name === '❌')
    .once('collect', () => {
      message.delete();
      botMessage.delete();
      collectorNumbers.stop();
      collectorStop.stop();
    });
}

export function randomCommand(commands, withoutPerms = true) {
  for (;;) {
    const command = commands[Math.floor(Math.random() * commands.length)];
    if (withoutPerms && command.permissions.length === 0) return command.aliases[0].toLowerCase();
  }
}

export function randomActivity(client, commands, prefix) {
  if (!client.activated) return { activity: { name: 'Désactivé.', type: 'WATCHING' }, status: 'idle' };
  const random = Math.floor(Math.random() * 3);
  let status;
  if (random === 0) status = { activity: { name: `${client.guild.members.cache.filter(m => !m.user.bot).size} membres 🎉`, type: 'WATCHING' }, status: 'online' };
  if (random === 1) status = { activity: { name: `${prefix}aide | Skript-MC`, type: 'WATCHING' }, status: 'online' };
  if (random === 2) status = { activity: { name: `${prefix}help ${randomCommand(commands)}`, type: 'PLAYING' }, status: 'dnd' };
  return status;
}
