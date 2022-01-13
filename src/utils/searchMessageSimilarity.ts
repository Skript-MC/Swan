import jaroWinklerDistance from 'jaro-winkler';
import type { MessageDocument, SimilarityMatch } from '@/app/types';

/**
 * Find the most similar MessageDocument given an array of MessageDocument and a query string.
 * @param {MessageDocument[]} entries - The pool of MessageDocument to search in.
 * @param {string} wanted - The query string to search for.
 * @returns MessageDocument | null
 */
export default function searchMessageSimilarity(entries: MessageDocument[], wanted: string): SimilarityMatch[] | null {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    // Avoid useless double loop after.
    if (entry.name === wanted) {
      return [{
        matchedName: '⭐ ' + entry.name,
        baseName: entry.name,
        similarity: 1,
      }];
    }
    matches.push({
      matchedName: entry.name,
      baseName: entry.name,
      similarity: jaroWinklerDistance(entry.name, wanted, { caseSensitive: false }),
    });
  }
  matches.sort((a, b) => b.similarity - a.similarity);
  matches[0].matchedName = '⭐ ' + matches[0].matchedName;
  return matches;
}
