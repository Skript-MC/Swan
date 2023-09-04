import { distance } from 'fastest-levenshtein';
import type { SimilarityMatch, SkriptMcDocumentationSyntaxAndAddon } from '@/app/types';
import { capitalize } from '@/app/utils/capitalize';

const categoryColorMap = {
  evenements: '🔴',
  conditions: '🔵',
  effets: '🟢',
  expressions: '🟣',
  types: '🟡',
  fonctions: '⚪',
};

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
      matchedName: capitalize(`${categoryColorMap[entry.category]} ${entry.addon.name} — ${entry.englishName ?? entry.name}`),
      baseName: entry.id.toString(),
      distance: distance((entry.englishName ?? entry.name).toLowerCase(), wanted.toLowerCase()),
    });
  }

  if (matches.length <= 0)
    return [];

  matches.sort((a, b) => a.distance - b.distance);
  matches[0].matchedName = `⭐ ${matches[0].matchedName}`;
  return matches;
}
