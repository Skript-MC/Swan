/* eslint-disable no-param-reassign */

export function padNumber(x) {
  return (x.toString().length < 2 ? `0${x}` : x).toString();
}

export function formatDate(d) {
  const date = new Date(d);
  const now = new Date(Date.now());
  let end;
  // Même jour, mois, année
  if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    end = `aujourd'hui à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  // Jour suivant, même mois, même année (pour éviter que 04/05/2015 soit "demain" quand on est le 03/08/2019)
  } else if (date.getDate() - 1 === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    end = `demain à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  } else {
    end = `le ${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${padNumber(date.getFullYear())} à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  }
  return end;
}

export function secondToDuration(n) {
  if (n === -1) return 'Définitif';

  const day = Math.floor(n / (24 * 3600));

  n %= (24 * 3600);
  const hour = Math.floor(n / 3600);

  n %= 3600;
  const minutes = Math.floor(n / 60);

  n %= 60;
  const seconds = Math.floor(n);

  let result = '';
  if (day !== 0) result += `${day} jour${day > 1 ? 's' : ''}, `;
  if (day === 0 && hour !== 0) result += `${hour} heure${hour > 1 ? 's' : ''}, `;
  result += `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} seconde${seconds > 1 ? 's' : ''}`;

  return result;
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
 * a = année
 * mo = mois
 * s = semaine
 * j = jour
 * h = heure
 * m = minute
 * sec = seconde
 * Nota: les lettres peuvent être en majuscule, ça sera pareil (le code fait pas la différence entre minuscule et majuscule)
 *
 * @example
 * import { toTimestamp } from '../../utils'
 * const votrevar = toTimestamp('3j5h15m'); // -> 278100
 */
export function toTimestamp(str) {
  const regexs = new Map();
  regexs.set(/sec/i, 1);
  regexs.set(/a/i, 29030400);
  regexs.set(/mo/i, 2419200);
  regexs.set(/s/i, 604800);
  regexs.set(/j/i, 86400);
  regexs.set(/h/i, 3600);
  regexs.set(/m/i, 60);

  String(str).replace(/\s+/, '');
  regexs.forEach((value, regex) => {
    str = String(str).replace(regex, `* ${value} +`);
  });

  let result;
  try {
    result = eval(str.slice(0, -1)) * 1000;
  } catch (e) {
    result = -1;
  }
  return result;
}
