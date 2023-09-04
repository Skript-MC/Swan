import { distance } from 'fastest-levenshtein';
import type { Task } from '@/app/structures/tasks/Task';
import type { SimilarityMatch } from '@/app/types';
import { capitalize } from '@/app/utils/capitalize';

/**
 * Find the closest Task given an array of Tasks and a query string.
 * Useful for command autocompletions.
 * @param {Task[]} entries - The pool of Tasks to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export function searchClosestTask(entries: Task[], wanted: string): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    // Avoid useless double loop after.
    if (entry.name === wanted) {
      return [{
        matchedName: `⭐ ${capitalize(entry.name)}`,
        baseName: entry.name,
        distance: 0,
      }];
    }
    matches.push({
      matchedName: capitalize(entry.name),
      baseName: entry.name,
      distance: distance(entry.name.toLowerCase(), wanted.toLowerCase()),
    });
  }

  if (matches.length <= 0)
    return [];

  matches.sort((a, b) => a.distance - b.distance);
  matches[0].matchedName = `⭐ ${matches[0].matchedName}`;
  return matches;
}
