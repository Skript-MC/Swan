import jaroWinklerDistance from 'jaro-winkler';
import type { SimilarityMatch } from '@/app/types';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import capitalize from '@/app/utils/capitalize';

/**
 * Find the closest SwanCommand given an array of SwanCommand and a query string.
 * Useful for command autocompletions.
 * @param {SwanCommand[]} entries - The pool of SwanCommand to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export default function searchClosestMessage(entries: SwanCommand[], wanted: string): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    // Avoid useless double loop after.
    if (entry.aliases[0] === wanted) {
      return [{
        matchedName: '⭐ ' + capitalize(entry.aliases[0]) + ' — ' + capitalize(entry.name),
        baseName: entry.name,
        similarity: 1,
      }];
    }
    matches.push({
      matchedName: capitalize(entry.aliases[0]) + ' — ' + capitalize(entry.name),
      baseName: entry.name,
      similarity: jaroWinklerDistance(entry.aliases[0], wanted, { caseSensitive: false }),
    });
  }
  if (matches.length <= 0)
    return [];
  matches.sort((a, b) => b.similarity - a.similarity);
  matches[0].matchedName = '⭐ ' + matches[0].matchedName;
  return matches;
}
