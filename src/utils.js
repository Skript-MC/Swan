/* eslint-disable no-param-reassign */
export function padNumber(x) {
  return (x.toString().length < 2 ? `0${x}` : x).toString();
}

export function formatDate(d) {
  const date = new Date(d);
  let end;
  if (date.getDate() === new Date(Date.now()).getDate()) {
    end = `aujourd'hui à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  } else if (date.getDate() - 1 === new Date(Date.now()).getDate()) {
    end = `demain à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  } else {
    end = `le ${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${padNumber(date.getFullYear())} à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
  }
  return end;
}

export function secondToDuration(n) {
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

/*
Utilisation :

import {timestamp} from '../../utils'
const votrevar = timestamp('3j5h15m');

Informations :
a = Année
mo = Mois
s = semaine
j = jour
h = heure
m = minute

Nota: les lettres peuvent être en majuscule, ça sera pareil (le code fait pas la différence entre minuscule et majuscule)

 */
export function timestamp (str) {
    const regexs = new Map();
    regexs.set(/a/i, 29030400);
    regexs.set(/mo/i, 2419200);
    regexs.set(/s/i, 604800);
    regexs.set(/j/i, 86400);
    regexs.set(/h/i, 3600);
    regexs.set(/m/i, 60);
    String(str).replace(/ /, '');
    regexs.forEach(function (valeur, regex) {
        str = String(str).replace(regex, valeur + '*');
    })
    
    return eval(str.slice(0, -1));
}
