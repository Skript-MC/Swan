/**
 * Capitalize the first letter of a given string.
 * @param {string} string - The string to capitalize.
 * @returns string
 */
export function capitalize(string: string): string {
  return string[0].toUpperCase() + string.slice(1);
}
