import * as nodeEmoji from 'node-emoji';
import type { GuildMessage } from '@/app/types';
import settings from '@/conf/settings';

export default function emote(message: GuildMessage, phrase: string): string | null {
  if (typeof phrase === 'undefined' || phrase === '')
    phrase = settings.emojis.yes;
  if (nodeEmoji.hasEmoji(phrase))
    return nodeEmoji.find(phrase).emoji;
  return message.client.util.resolveEmoji(phrase, message.guild.emojis.cache)?.toString();
}
