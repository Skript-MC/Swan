/**
 * Split a long text into an array of strings of 2000 characters maximum, and between each line.
 *
 * @param {string} text - The text to split.
 * @returns string[]
 */
function splitText(text: string): string[] {
  const blocks: string[] = [];
  const lines: string [] = text.split(/\n/g);
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

export default splitText;
