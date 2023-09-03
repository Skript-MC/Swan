import { PreconditionContainerSingle } from '@sapphire/framework';
import type { AutocompleteInteraction } from 'discord.js';
import { GuildMemberRoleManager } from 'discord.js';
import { distance } from 'fastest-levenshtein';
import type { RolePreconditionContext } from '@/app/preconditions/Role';
import type { SwanCommand } from '@/app/structures/commands/SwanCommand';
import type { SimilarityMatch } from '@/app/types';
import { capitalize } from '@/app/utils/capitalize';

/**
 * Find the closest SwanCommand given an array of SwanCommand and a query string.
 * Useful for command autocompletions.
 * @param {SwanCommand[]} entries - The pool of SwanCommand to search in.
 * @param interaction
 * @param {string} wanted - The query string to search for.
 * @returns SimilarityMatch[]
 */
export function searchClosestCommand(
  entries: SwanCommand[],
  interaction: AutocompleteInteraction,
  wanted: string,
): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];
  for (const entry of entries) {
    if (!entry.command)
      continue;
    let hasRole = true;
    for (const precondition of entry.preconditions.entries) {
      if (precondition instanceof PreconditionContainerSingle && precondition.name === 'Role') {
        const { roles } = interaction.member;
        const context = precondition.context as RolePreconditionContext;
        if (roles instanceof GuildMemberRoleManager && !roles.cache.has(context.role))
          hasRole = false;
        else if (Array.isArray(roles) && !roles.includes(context.role))
          hasRole = false;
      }
    }
    if (!hasRole)
      continue;
    // Avoid useless double loop after.
    if (entry.command === wanted) {
      return [{
        matchedName: '⭐ ' + capitalize(entry.command) + ' — ' + capitalize(entry.name),
        baseName: entry.name,
        similarity: 1,
      }];
    }
    matches.push({
      matchedName: capitalize(entry.command) + ' — ' + capitalize(entry.name),
      baseName: entry.name,
      similarity: distance(entry.command.toLowerCase(), wanted.toLowerCase()),
    });
  }
  if (matches.length <= 0)
    return [];
  matches.sort((a, b) => b.similarity - a.similarity);
  matches[0].matchedName = '⭐ ' + matches[0].matchedName;
  return matches;
}
