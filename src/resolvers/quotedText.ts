import type { Message } from 'discord.js';
import { extractQuotedText } from '../utils';

export default function quotedText(_message: Message, phrase: string): string[] | null {
  const parsedText = extractQuotedText(phrase);
  return parsedText.length === 0 ? [phrase] : parsedText;
}
