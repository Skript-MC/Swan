import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { eightBall as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class EightBallCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    if (args.finished) {
      await message.channel.send(messages.prompt.question);
      return;
    }

    await this._exec(message);
  }

  private async _exec(message: GuildMessage): Promise<void> {
    const isAffirmative = Math.random() > 0.5;
    const pool = config.messages[isAffirmative ? 'affirmative' : 'negative'];
    const answer = pool[Math.floor(Math.random() * pool.length)];
    await message.channel.send(answer);
  }
}
