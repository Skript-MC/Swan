const units = [
  [1024 ** 0, 'octets'],
  [1024 ** 1, 'Ko'],
  [1024 ** 2, 'Mo'],
  [1024 ** 3, 'Go'],
  [1024 ** 4, 'To'],
] as const;

/**
 * Convert a number to a file size in octets.
 * @param {number} size - The size to convert.
 * @returns string
 */
export function convertFileSize(size: number): string {
  const absSize = Math.abs(size);

  for (let i = 1; i < units.length; i++) {
    if (absSize < units[i][0])
      return `${(absSize / units[i - 1][0]).toFixed(2)} ${units[i - 1][1]}`;
  }
  return 'Plusieurs pétaoctets';
}
