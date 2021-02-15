import { Command } from 'discord-akairo';
import type { EightBallCommandArguments } from '@/app/types/CommandArguments';
import type { GuildMessage } from '@/app/types/index';
import { eightBall as config } from '@/conf/commands/fun';

class EightBallCommand extends Command {
  constructor() {
    super('eightBall', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'question',
        type: 'string',
        match: 'content',
        prompt: {
          start: config.messages.promptStart,
          retry: config.messages.promptRetry,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, _args: EightBallCommandArguments): Promise<void> {
    const isAffirmative = Math.random() > 0.5;
    const pool = config.messages[isAffirmative ? 'affirmative' : 'negative'];
    const answer = pool[Math.floor(Math.random() * pool.length)];
    await message.channel.send(answer);
  }
}

export default EightBallCommand;
