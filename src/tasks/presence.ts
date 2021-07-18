import { ApplyOptions } from '@sapphire/decorators';
import { PieceContext } from '@sapphire/pieces';
import type { PresenceData } from 'discord.js';
import pupa from 'pupa';
import Task, { TaskOptions } from '@/app/structures/tasks/Task';
import settings from '@/conf/settings';
import { presence as config } from '@/conf/tasks';

@ApplyOptions<TaskOptions>({ cron: '* * * * *' })
export default class PresenceTask extends Task {
  activities: Generator<PresenceData, never>;

  constructor(ctx: PieceContext, options: TaskOptions) {
    super(ctx, options);
    this.activities = this._getActivity();
  }

  public override async run(): Promise<void> {
    await this.context.client.user.setPresence(this.activities.next().value);
  }

  private * _getActivity(): Generator<PresenceData, never> {
    let i = 0;
    while (true) {
      yield {
        activity: {
          name: pupa(config.messages[i], {
            memberCount: this.context.client.guild.memberCount,
            prefix: settings.bot.prefix,
          }),
          type: 'WATCHING',
        },
        status: 'online',
      };
      i++;
      if (i >= config.messages.length)
        i = 0;
    }
  }
}
