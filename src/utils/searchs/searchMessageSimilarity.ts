import { distance } from 'fastest-levenshtein';
import type { MessageDocument } from '#types/index';

/**
 * Find the most similar MessageDocument given an array of MessageDocument and a query string.
 * @param {MessageDocument[]} entries - The pool of MessageDocument to search in.
 * @param {string} wanted - The query string to search for.
 * @returns MessageDocument | null
 */
export function searchMessageSimilarity(
  entries: MessageDocument[],
  wanted: string,
): MessageDocument | null {
  const search: Array<[message: MessageDocument, similarity: number]> = [];
  for (const entry of entries) {
    // Avoid useless double loop after.
    if (entry.aliases.includes(wanted) || entry.name === wanted) return entry;
    for (const alias of entry.aliases) {
      const ltDistance = distance(alias.toLowerCase(), wanted.toLowerCase());
      if (ltDistance >= 0.7) search.push([entry, ltDistance]);
    }
  }
  search.sort((a, b) => a[1] - b[1]);
  if (search.length === 0) return null;
  return search[0][0];
}
