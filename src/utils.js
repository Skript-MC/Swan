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
