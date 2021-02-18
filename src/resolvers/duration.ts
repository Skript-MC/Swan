import type { Message } from 'discord.js';
import { getDuration } from '@/app/utils';
import settings from '@/conf/settings';

export default function duration(_message: Message, phrase: string): number | null {
  if (!phrase)
    return null;

  if (settings.miscellaneous.permanentKeywords.includes(phrase))
    return -1;

  try {
    return getDuration(phrase);
   } catch {
    return null;
   }
}
