/* eslint-disable import/no-cycle, no-param-reassign */
const math = require('mathjs');

export function padNumber(x) {
  return (x.toString().length < 2 ? `0${x}` : x).toString();
}

export function uncapitalize(string) {
  return string[0].toLowerCase() + string.slice(1);
}

export function formatDate(d) {
  const date = new Date(d);
  const now = new Date(Date.now());
  // Même jour, mois, année
  if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `aujourd'hui à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  }
  // Jours suivants, même mois, même année (pour éviter que 04/05/2015 soit "demain" quand on est le 03/08/2019)
  if (date.getDate() - 1 === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `demain à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  }
  if (date.getDate() - 2 === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `après-demain à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  }
  // Jours précédents, même mois, même année (pour éviter que 04/05/2015 soit "hier" quand on est le 05/08/2019)
  if (date.getDate() + 1 === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `hier à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  }
  if (date.getDate() + 2 === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `avant-hier à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  }
  // Date par défaut.
  return `le ${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${padNumber(date.getFullYear())} à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
}

export function secondToDuration(ms) {
  if (ms === -1) return 'Définitif';

  const day = Math.floor(ms / (24 * 3600));
  ms %= 86400; // 24 * 3600
  const hour = Math.floor(ms / 3600);
  ms %= 3600;
  const minutes = Math.floor(ms / 60);
  ms %= 60;
  const seconds = Math.floor(ms);

  const results = [];
  if (day !== 0) results.push(`${day} jour${day > 1 ? 's' : ''}`);
  if (hour !== 0) results.push(`${hour} heure${hour > 1 ? 's' : ''}`);
  if (minutes !== 0) results.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds !== 0) results.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`);
  return results.join(', ');
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
  const regexs = new Map();
  regexs.set(/a/i, 29030400);
  regexs.set(/mo/i, 2419200);
  regexs.set(/sem/i, 604800);
  regexs.set(/j/i, 86400);
  regexs.set(/h/i, 3600);
  regexs.set(/min/i, 60);
  regexs.set(/m/i, 60);
  regexs.set(/s/i, 1);

  String(str).replace(/\s+/, '');
  regexs.forEach((value, regex) => {
    str = String(str).replace(regex, `* ${value} +`);
  });

  let result;
  try {
    result = math.evaluate(str.slice(0, -1));
  } catch (e) {
    result = -1;
  }
  return result * 1000;
}

/**
 * @description Élaguer le pseudo d'un membre, pour qu'il puisse être utilisé dans le nom d'un channel textuel.
 * @param {GuildMember} member Le membre
 */
export function prunePseudo(member) {
  const name = member.nickname || member.user.username;
  let cleanPseudo = name.replace(/[^a-zA-Z0-9]/gimu, '');
  if (cleanPseudo.length === 0) cleanPseudo = member.id;
  return cleanPseudo.toLowerCase();
}

/**
 * @description Élaguer le pseudo d'un membre, pour qu'il puisse être mentionné par tout le monde.
 * @param {GuildMember} member Le membre
 */
export function prunePseudoJoin(member) {
  const name = member.nickname || member.user.username;
  return new RegExp(/[^a-zA-Z0-9-ÖØ-öø-ÿ]/gimu).test(name);
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
 * @param {Array} results - The array we should itterate
 * @param {string} query - The query the user passed (basically a args.join(' '))
 * @param {Message} message - The user's message
 * @param {Object} cmdConfig - The config of the command (basically this.config)
 * @param {Function} messageCallback - The callback to print a line
 * @param {Function} callback - The callback to call when the user has made his choice
 */
export async function selectorMessage(results, query, message, cmdConfig, messageCallback, callback) {
  const conf = {
    searchResults: '%r élements trouvés pour la recherche `%s`. Quel addon vous intéresse ?\n:warning: **Attendez que la réaction :x: soit ajoutée avant de commencer.**',
  };
  const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
  let content = conf.searchResults.replace('%r', results.length).replace('%s', query);

  for (let i = 0; i < results.length; i++) content += `\n${reactionsNumbers[i]} ${messageCallback(results[i])}`;

  if (results.length - 10 > 0) content += `\n...et ${results - 10} de plus...`;
  const botMessage = await message.channel.send(content);

  for (let i = 0; i < results.length; i++) await botMessage.react(reactionsNumbers[i]);
  await botMessage.react('❌');

  const collectorNumbers = botMessage
    .createReactionCollector((reaction, user) => !user.bot
      && user.id === message.author.id
      && reactionsNumbers.includes(reaction.emoji.name))
    .once('collect', (reaction) => {
      botMessage.delete();
      callback(message, results[reactionsNumbers.indexOf(reaction.emoji.name)], cmdConfig);
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
