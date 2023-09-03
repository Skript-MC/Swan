/**
 * Trim a text to a given size, and add "...".
 * @param {string} text - The text to reduce.
 * @param {number} size - The maximum allowed size.
 * @returns string
 */
export function trimText(text: string, size: number): string {
  return text.length > size ? `${text.slice(0, size - 3)}...` : text;
}
