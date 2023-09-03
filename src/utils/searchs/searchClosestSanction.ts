import { container } from '@sapphire/pieces';
import jaroWinklerDistance from 'jaro-winkler';
import type { SanctionDocument, SimilarityMatch } from '@/app/types';

/**
 * Find the closest sanction given an array of sanctions and a query string.
 * Useful for command autocompletions.
 * @param {string[]} entries - The pool of sanctions to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export async function searchClosestSanction(
  entries: SanctionDocument[],
  wanted: string,
): Promise<SimilarityMatch[]> {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    const user = await container.client.users.fetch(entry.userId);

    // Avoid useless double loop after.
    if (user.username === wanted) {
      return [{
        matchedName: '⭐ ' + user.tag,
        baseName: entry.userId,
        similarity: 1,
      }];
    }
    matches.push({
      matchedName: user.tag,
      baseName: entry.userId,
      similarity: jaroWinklerDistance(user.username, wanted, { caseSensitive: false }),
    });
  }
  if (matches.length <= 0)
    return [];
  matches.sort((a, b) => b.similarity - a.similarity);
  matches[0].matchedName = '⭐ ' + matches[0].matchedName;
  return matches;
}
