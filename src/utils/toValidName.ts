/**
 * Get back the given string with all ascii codes below 0x80 removed, except common accents.
 *
 * @param {string} str - The string to strip.
 * @returns string
 */
function toValidName(str: string): string {
  const valid: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (['é', 'è', 'à', 'ù', 'ô', 'â', 'ê', 'ë', 'î', 'ï'].includes(char.toLowerCase())) {
      valid.push(char);
      continue;
    }
    const charcode = str.charCodeAt(i);
    if (charcode < 0x80)
      valid.push(char);
  }
  return valid.join('');
}

export default toValidName;
