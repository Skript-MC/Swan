/**
 * Returns an escaped code string from the given text
 * @param {string} text - The text to escape the code from
 * @returns string
 */
export function escapeCode(text: string): string {
  return text.replaceAll(/```/g, '');
}
