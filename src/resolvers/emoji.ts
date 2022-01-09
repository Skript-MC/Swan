import type { Result } from '@sapphire/framework';
import { err, ok } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Guild, GuildEmoji } from 'discord.js';

function checkEmoji(parameter: string, emoji: GuildEmoji): boolean {
  if (emoji.id === parameter)
    return true;

  const pattern = /<a?:\w+:\d{17,19}>/;
  const match = pattern.exec(parameter);
  if (match && emoji.id === match[1])
    return true;

  return emoji.name === parameter || emoji.name === parameter.replace(/:/, '');
}

export default function resolveEmoji(parameter: string, guild: Guild): Result<GuildEmoji, 'emojiError'> {
  const emojis = guild.emojis.cache;
  const emoji = emojis.get(parameter) || emojis.find(emoj => checkEmoji(parameter, emoj));

  if (isNullish(emoji))
    return err('emojiError');
  return ok(emoji);
}
