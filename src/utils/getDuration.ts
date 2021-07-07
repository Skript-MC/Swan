import type { DurationPart } from '@/app/types';

const REGEX = /^(?<number>\d+) ?(?<unit>\w+)$/i;

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

// eslint-disable-next-line complexity
function convert(num: number, type: string): number {
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
    case 'annees':
    case 'années':
    case 'annee':
    case 'année':
    case 'ans':
    case 'an':
    case 'a':
      return num * Durations.Year;
    case 'months':
    case 'month':
    case 'mois':
    case 'mo':
      return num * Durations.Month;
    case 'weeks':
    case 'week':
    case 'w':
    case 'semaines':
    case 'semaine':
    case 'sem':
      return num * Durations.Week;
    case 'days':
    case 'day':
    case 'd':
    case 'jours':
    case 'jour':
    case 'j':
      return num * Durations.Day;
    case 'hours':
    case 'hour':
    case 'heures':
    case 'heure':
    case 'hrs':
    case 'hr':
    case 'h':
      return num * Durations.Hour;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return num * Durations.Minute;
    case 'seconds':
    case 'second':
    case 'secondes':
    case 'seconde':
    case 'secs':
    case 'sec':
    case 's':
      return num * Durations.Second;
    default:
      throw new TypeError(`Invalid duration unit: ${type}`);
  }
}

/**
 * Parses a human duration to a timestamp in seconds.
 * @param {string} val - The value to parse as a duration.
 * @returns number
 * @throws {TypeError} - If the given duration is invalid, it will throw a TypeError
 */
function getDuration(val: string): number {
  let abs: number;
  let total = 0;
  if (val.length > 0 && val.length < 101) {
    const parts = tokenize(val.toLowerCase())
      .map((part: string): DurationPart => {
        const groups = REGEX.exec(part)?.groups;
        if (!groups || !groups.number || !groups.unit)
          throw new TypeError(`Value is an invalid duration (${JSON.stringify(val)})`);

        return { number: groups.number, unit: groups.unit };
      });
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
  throw new TypeError(`Value is an empty string, an invalid number, or too long (>100). Value=${JSON.stringify(val)}`);
}

export default getDuration;
