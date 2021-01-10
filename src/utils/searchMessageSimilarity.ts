import type { MessageDocument } from '../types';
import { jaroWinklerDistance } from './index';

function searchMessageSimilarity(entries: MessageDocument[], wanted: string): MessageDocument {
  // Avoid useless double loop after
  for (const entry of entries)
    if (entry.aliases.some(alias => alias === wanted) || entry.name === wanted) return entry;
  const search: Array<MessageDocument|number> = [];
  for (const entry of entries) {
    for (const alias of entry.aliases) {
      const distance = jaroWinklerDistance(alias, wanted);
      if (distance >= 0.4) search.push(entry, distance);
    }
  }
  search.sort((a, b) => a[1] - b[1]);
  return search[0] as MessageDocument;
}

export default searchMessageSimilarity;
