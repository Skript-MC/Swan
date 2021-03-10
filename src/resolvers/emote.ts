import * as nodeEmoji from 'node-emoji';
import settings from '@/conf/settings';
import type { GuildMessage } from '../types';

export default function emote(_message: GuildMessage, phrase: string): string | null {
  if (typeof phrase === 'undefined')
    phrase = settings.emojis.yes;
  if (nodeEmoji.hasEmoji(phrase))
    return nodeEmoji.find(phrase).emoji;
  const splitted = phrase.split(':');
  const id = splitted[splitted.length - 1].split('>')[0];
  const emoji = _message.guild.emojis.cache.get(id);
  return emoji?.toString();
}
