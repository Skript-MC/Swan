import type { Message } from 'discord.js';
import { getDuration } from '@/app/utils';

export default function finiteDuration(_message: Message, phrase: string): number | null {
  if (!phrase)
    return null;

  try {
    return getDuration(phrase);
  } catch {
    return null;
  }
}
