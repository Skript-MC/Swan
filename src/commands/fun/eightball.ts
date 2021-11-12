import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { EightBallCommandArguments } from '@/app/types/CommandArguments';
import { eightBall as config } from '@/conf/commands/fun';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class EightBallCommand extends SwanCommand {
  @Arguments({
    name: 'question',
    type: 'string',
    match: 'rest',
    required: true,
    message: config.messages.promptRetry,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, _args: EightBallCommandArguments): Promise<void> {
    const isAffirmative = Math.random() > 0.5;
    const pool = config.messages[isAffirmative ? 'affirmative' : 'negative'];
    const answer = pool[Math.floor(Math.random() * pool.length)];
    await message.channel.send(answer);
  }
}
