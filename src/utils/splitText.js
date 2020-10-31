/**
 * Split a long text into an Array of strings of 2000 chars. max, and between each line.
 * @param {String} text - The  text to split
 */
export default function splitText(text) {
  const blocks = [];
  const lines = text.split(/\n/g);
  let index = 0;

  for (const line of lines) {
    if ((blocks[index] || '').length + line.length >= 2000)
      index++;
    if (!blocks[index])
      blocks[index] = '';

    blocks[index] += `${line}\n`;
  }

  return blocks;
}
