import type { Message } from 'discord.js';
import { getDuration } from '@/app/utils';

export default function duration(_message: Message, phrase: string): number | null {
  if (!phrase)
    return null;

  if (['def', 'déf', 'definitif', 'définitif', 'perm', 'perma', 'permanent'].includes(phrase))
    return -1;

  try {
    return getDuration(phrase);
   } catch {
    return null;
   }
}
