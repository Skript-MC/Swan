export interface DurationPart {
  number: string;
  unit: string;
}

const REGEX = /^(?<number>\d+) ?(?<unit>[a-z]+)?$/i;

enum Durations {
  /* eslint-disable no-multi-spaces, @typescript-eslint/prefer-literal-enum-member */
  Second = 1,
  Minute = 1 * 60,
  Hour   = 1 * 60 * 60,
  Day    = 1 * 60 * 60 * 24,
  Week   = 1 * 60 * 60 * 24 * 7,
  Month  = 1 * 60 * 60 * 24 * 30,
  Year   = 1 * 60 * 60 * 24 * 365,
}

function tokenize(str: string): string[] {
  const units: string[] = [];
  let buf = '';
  let letter = false;

  for (const char of str) {
    if (['.', ','].includes(char)) {
      buf += char;
    } else if (Number.isNaN(Number.parseInt(char, 10))) {
      buf += char;
      letter = true;
    } else {
      if (letter) {
        units.push(buf.trim());
        buf = '';
      }
      letter = false;
      buf += char;
    }
  }

  if (buf.length > 0)
    units.push(buf.trim());
  return units;
}

const durations: Array<[values: string[], multiplier: Durations]> = [
  [['years', 'year', 'y', 'annees', 'années', 'annee', 'année', 'ans', 'an', 'a'], Durations.Year],
  [['months', 'month', 'mois', 'mo'], Durations.Month],
  [['weeks', 'week', 'w', 'semaines', 'semaine', 'sem'], Durations.Week],
  [['days', 'day', 'd', 'jours', 'jour', 'j'], Durations.Day],
  [['hours', 'hour', 'heures', 'heure', 'hrs', 'hr', 'h'], Durations.Hour],
  [['minutes', 'minute', 'mins', 'min', 'm'], Durations.Minute],
  [['seconds', 'second', 'secondes', 'seconde', 'secs', 'sec', 's'], Durations.Second],
];

function convert(num: number, type: string): number {
  const multiplier = durations.find(([values]) => values.includes(type))?.[1];
  if (multiplier)
    return num * multiplier;

  throw new TypeError(`Invalid duration unit: ${type}`);
}

/**
 * Parses a human duration to a timestamp in seconds.
 * @param val The value to parse as a duration
 * @returns The duration in milliseconds
 * @throws {TypeError} If the given duration is invalid, it will throw a TypeError
 */
export default function getDuration(val: string): number {
  let abs: number;
  let total = 0;
  if (val.length > 0 && val.length < 101) {
    const parts: DurationPart[] = [];
    const tokens = tokenize(val.toLowerCase());

    for (const [i, token] of tokens.entries()) {
      const groups = REGEX.exec(token)?.groups;

      const previousUnit = parts[i - 1]?.unit;
      const nextUnit = durations.findIndex(([values]) => values.includes(previousUnit)) + 1;
      const newUnit = durations[nextUnit]?.[0][0];

      if (!groups || !groups.number || (!groups.unit && nextUnit === 0))
        throw new TypeError('Value is an invalid duration');

      parts.push({ number: groups.number, unit: groups.unit ?? newUnit });
    }

    if (parts.length > 0) {
      for (const { number, unit } of parts) {
        if (number && unit) {
          abs = Number.parseInt(number, 10);
          total += convert(abs, unit);
        }
      }
    }
    return total;
  }
  throw new RangeError('Invalid string size');
}
