import jaroWinklerDistance from 'jaro-winkler';
import type { MessageDocument } from '@/app/types';

function searchMessageSimilarity(entries: MessageDocument[], wanted: string): MessageDocument | null {
  const search: Array<[message: MessageDocument, similarity: number]> = [];
  for (const entry of entries) {
    // Avoid useless double loop after
    if (entry.aliases.includes(wanted) || entry.name === wanted)
      return entry;
    for (const alias of entry.aliases) {
      const distance = jaroWinklerDistance(alias, wanted, { caseSensitive: false });
      if (distance >= 0.7)
        search.push([entry, distance]);
    }
  }
  search.sort((a, b) => b[1] - a[1]);
  if (search.length === 0)
    return null;
  return search[0][0];
}

export default searchMessageSimilarity;
