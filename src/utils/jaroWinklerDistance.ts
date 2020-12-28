function jaroWinklerDistance(s1: string, s2: string): number {
  s1 = s1.toUpperCase();
  s2 = s2.toUpperCase();
  if (s1.length === 0 || s2.length === 0)
    return 0;
  if (s1 === s2)
    return 1;

  let m = 0;
  const range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
  const s1Matches: boolean[] = new Array(s1.length);
  const s2Matches: boolean[] = new Array(s2.length);

  for (const [i, element] of [...s1].entries()) {
    const low = i >= range ? i - range : 0;
    const high = i + range <= (s2.length - 1) ? i + range : s2.length - 1;
    for (let j = low; j <= high; j++) {
      if (!s1Matches[i] && !s2Matches[j] && element === s2[j]) {
        ++m;
        s1Matches[i] = true;
        s2Matches[j] = true;
        break;
      }
    }
  }

  if (m === 0)
    return 0;

  let k = 0;
  let numTrans = 0;

  // No! This is a string, not an array. See https://github.com/sindresorhus/eslint-plugin-unicorn/issues/738
  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i]) {
      let j: number;
      for (j = k; j < s2.length; j++) {
        if (s2Matches[j]) {
          k = j + 1;
          break;
        }
      }

      if (s1[i] !== s2[j])
        ++numTrans;
    }
  }

  let weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
  let l = 0;

  if (weight > 0.7) {
    while (s1[l] === s2[l] && l < 4)
      ++l;
    weight += l * 0.1 * (1 - weight);
  }

  return weight;
}

export default jaroWinklerDistance;
