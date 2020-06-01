/**
 * Split un long texte en un Array de strings de 2000 car. max chacun, et entre chaque ligne
 * @param {String} code - Le texte à split
 */
export default function splitText(text) {
  const blocks = [];
  const lines = text.split(/\n/g);
  let index = 0;

  for (const line of lines) {
    if ((blocks[index] || '').length + line.length >= 2000) index++;
    if (!blocks[index]) blocks[index] = '';

    blocks[index] += `${line}\n`;
  }

  return blocks;
}
