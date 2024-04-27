import { distance } from 'fastest-levenshtein';
import type { SimilarityMatch } from '#types/index';
import { capitalize } from '#utils/capitalize';

/**
 * Find the closest addon given an array of addons and a query string.
 * Useful for command autocompletions.
 * @param {string[]} entries - The pool of addons to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export function searchClosestAddon(
  entries: string[],
  wanted: string,
): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    if (!entry) continue;

    const name = entry.split(' ').shift();
    if (!name) continue;

    // Avoid useless double loop after.
    if (entry === wanted) {
      return [
        {
          matchedName: `⭐ ${capitalize(name)}`,
          baseName: entry,
          distance: 0,
        },
      ];
    }
    matches.push({
      matchedName: capitalize(name),
      baseName: entry,
      distance: distance(name.toLowerCase(), wanted.toLowerCase()),
    });
  }

  if (matches.length <= 0) return [];

  matches.sort((a, b) => a.distance - b.distance);
  matches[0].matchedName = `⭐ ${matches[0].matchedName}`;
  return matches;
}
