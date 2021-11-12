import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type { GuildEmoji } from 'discord.js';

export default class EmojiArgument extends Argument<GuildEmoji> {
  public override run(parameter: string, context: ArgumentContext<GuildEmoji>): ArgumentResult<GuildEmoji> {
    const emojis = context.args.message.guild.emojis.cache;
    const emoji = emojis.get(parameter) || emojis.find(emoj => this._checkEmoji(parameter, emoj));

    return emoji
      ? this.ok(emoji)
      : this.error({ parameter, message: 'The argument did not resolve to an emoji.', context });
  }

  private _checkEmoji(parameter: string, emoji: GuildEmoji): boolean {
    if (emoji.id === parameter)
      return true;

    const pattern = /<a?:\w+:\d{17,19}>/;
    const match = pattern.exec(parameter);
    if (match && emoji.id === match[1])
      return true;

    return emoji.name === parameter || emoji.name === parameter.replace(/:/, '');
  }
}
