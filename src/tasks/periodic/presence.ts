import { ApplyOptions } from '@sapphire/decorators';
import { PieceContext } from '@sapphire/pieces';
import type { PresenceData } from 'discord.js';
import { ActivityType } from 'discord.js';
import pupa from 'pupa';
import Task, { TaskOptions } from '@/app/structures/tasks/Task';
import settings from '@/conf/settings';
import { presence as config } from '@/conf/tasks';

@ApplyOptions<TaskOptions>({ cron: '* * * * *' })
export default class PresenceTask extends Task {
  activities: Generator<PresenceData, never>;

  constructor(context: PieceContext, options: TaskOptions) {
    super(context, options);
    this.activities = this._getActivity();
  }

  public override run(): void {
    this.container.client.user.setPresence(this.activities.next().value);
  }

  private * _getActivity(): Generator<PresenceData, never> {
    let i = 0;
    while (true) {
      yield {
        activities: [{
          name: pupa(config.messages[i], {
            memberCount: this.container.client.guild.memberCount,
            prefix: settings.bot.prefix,
          }),
          type: ActivityType.Watching,
        }],
        status: 'online',
      };
      i++;
      if (i >= config.messages.length)
        i = 0;
    }
  }
}
