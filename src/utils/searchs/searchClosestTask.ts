import jaroWinklerDistance from 'jaro-winkler';
import type Task from '@/app/structures/tasks/Task';
import type { SimilarityMatch } from '@/app/types';
import capitalize from '@/app/utils/capitalize';

/**
 * Find the closest Task given an array of Tasks and a query string.
 * Useful for command autocompletions.
 * @param {Task[]} entries - The pool of Tasks to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export default function searchClosestMessage(entries: Task[], wanted: string): SimilarityMatch[] {
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
