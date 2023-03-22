import jaroWinklerDistance from 'jaro-winkler';
import type { SimilarityMatch } from '@/app/types';
import capitalize from '@/app/utils/capitalize';

/**
 * Find the closest addon given an array of addons and a query string.
 * Useful for command autocompletions.
 * @param {string[]} entries - The pool of addons to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export default function searchClosestMessage(entries: string[], wanted: string): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    if (!entry)
      continue;
    // Avoid useless double loop after.
    if (entry === wanted) {
      return [{
        matchedName: '⭐ ' + capitalize(entry.split(' ').shift()!),
        baseName: entry,
        similarity: 1,
      }];
    }
    matches.push({
      matchedName: capitalize(entry.split(' ').shift()!),
      baseName: entry,
      similarity: jaroWinklerDistance(entry.split(' ').shift()!, wanted, { caseSensitive: false }),
    });
  }
  if (matches.length <= 0)
    return [];
  matches.sort((a, b) => b.similarity - a.similarity);
  matches[0].matchedName = '⭐ ' + matches[0].matchedName;
  return matches;
}
