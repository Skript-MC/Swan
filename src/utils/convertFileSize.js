function convertFileSize(size) {
  size = Math.abs(parseInt(size, 10));
  const def = [[1, 'octets'], [1024, 'ko'], [1024 ** 2, 'Mo'], [1024 ** 3, 'Go'], [1024 ** 4, 'To']];

  for (let i = 1; i < def.length; i++) {
    if (size < def[i][0])
      return `${(size / def[i - 1][0]).toFixed(2)} ${def[i - 1][1]}`;
  }
}

export default convertFileSize;
