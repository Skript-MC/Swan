import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { eightBall as config } from '@/conf/commands/fun';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class EightBallCommand extends SwanCommand {
  // [{
  //   id: 'question',
  //   type: 'string',
  //   match: 'content',
  //   prompt: {
  //     start: config.messages.promptStart,
  //     retry: config.messages.promptRetry,
  //   },
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    const question = await args.restResult('string');
    if (question.error)
      return void await message.channel.send(config.messages.promptRetry);

    const isAffirmative = Math.random() > 0.5;
    const pool = config.messages[isAffirmative ? 'affirmative' : 'negative'];
    const answer = pool[Math.floor(Math.random() * pool.length)];
    await message.channel.send(answer);
  }
}
