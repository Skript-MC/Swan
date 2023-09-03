import { distance } from 'fastest-levenshtein';
import type { SimilarityMatch, SkriptMcDocumentationSyntaxAndAddon } from '@/app/types';
import { capitalize } from '@/app/utils/capitalize';

function getCategoryColor(category: string): string {
  switch (category) {
    case 'evenements':
      return '🔴';
    case 'conditions':
      return '🔵';
    case 'effets':
      return '🟢';
    case 'expressions':
      return '🟣';
    case 'types':
      return '🟡';
    case 'fonctions':
      return '⚪';
  }
}

/**
 * Find the closest addon given an array of addons and a query string.
 * Useful for command autocompletions.
 * @param {string[]} entries - The pool of addons to search in.
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export function searchClosestArticle(
  entries: SkriptMcDocumentationSyntaxAndAddon[],
  wanted: string,
): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    // Avoid useless double loop after.
    matches.push({
      matchedName: capitalize(getCategoryColor(entry.category) + ' ' + entry.addon.name + ' — ' + (entry.englishName ?? entry.name)),
      baseName: entry.id.toString(),
      similarity: distance((entry.englishName ?? entry.name).toLowerCase(), wanted.toLowerCase()),
    });
  }
  if (matches.length <= 0)
    return [];
  matches.sort((a, b) => b.similarity - a.similarity);
  matches[0].matchedName = '⭐ ' + matches[0].matchedName;
  return matches;
}
