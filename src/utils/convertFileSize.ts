const units: Array<[number, string]> = [
  [1024 ** 0, 'octets'],
  [1024 ** 1, 'ko'],
  [1024 ** 2, 'Mo'],
  [1024 ** 3, 'Go'],
  [1024 ** 4, 'To'],
];

function convertFileSize(size: number): string {
  size = Math.abs(size);

  for (let i = 1; i < units.length; i++) {
    if (size < units[i][0])
      return `${(size / units[i - 1][0]).toFixed(2)} ${units[i - 1][1]}`;
  }
}

export default convertFileSize;
