import { EmojiRegex } from '@sapphire/discord-utilities';
import type { Result } from '@sapphire/framework';
import { err, ok } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Guild } from 'discord.js';
import * as nodeEmoji from 'node-emoji';

const regex =
  // biome-ignore lint/suspicious/noMisleadingCharacterClass:
  /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}\u{1F1E6}-\u{1F1FF}]/gu;

export function resolveEmoji(parameter: string, guild: Guild): Result<string, 'emojiError'> {
  if (!parameter) return err('emojiError');

  const regexResult = EmojiRegex.exec(parameter)?.[3];

  const emoji =
    nodeEmoji.find(parameter)?.emoji ||
    (regexResult && guild.emojis.cache.get(regexResult)?.toString()) ||
    parameter.match(regex)?.[0];
  if (isNullish(emoji)) return err('emojiError');
  return ok(emoji);
}
