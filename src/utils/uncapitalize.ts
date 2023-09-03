/**
 * Uncapitalize the first letter of a given string.
 * @param {string} string - The string to un-capitalize.
 * @returns string
 */
export function uncapitalize(string: string): string {
  return string[0].toLowerCase() + string.slice(1);
}
