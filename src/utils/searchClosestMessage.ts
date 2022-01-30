import jaroWinklerDistance from 'jaro-winkler';
import type { MessageDocument, SimilarityMatch } from '@/app/types';
import capitalize from '@/app/utils/capitalize';

/**
 * Find the closest MessageDocument given an array of MessageDocument and a query string.
 * Useful for command autocompletions.
 * @param {MessageDocument[]} entries - The pool of MessageDocument to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export default function searchClosestMessage(entries: MessageDocument[], wanted: string): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    // Avoid useless double loop after.
    if (entry.name === wanted) {
      return [{
        matchedName: '⭐ ' + capitalize(entry.name),
        baseName: entry.name,
        similarity: 1,
      }];
    }
    matches.push({
      matchedName: capitalize(entry.name),
      baseName: entry.name,
      similarity: jaroWinklerDistance(entry.name, wanted, { caseSensitive: false }),
    });
  }
  if (matches.length <= 0)
    return [];
  matches.sort((a, b) => b.similarity - a.similarity);
  matches[0].matchedName = '⭐ ' + matches[0].matchedName;
  return matches;
}
