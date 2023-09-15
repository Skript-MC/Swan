import { ApplyOptions } from '@sapphire/decorators';
import { PieceContext } from '@sapphire/pieces';
import type { PresenceData } from 'discord.js';
import { ActivityType } from 'discord.js';
import pupa from 'pupa';
import { presence as config } from '#config/tasks';
import { Task, TaskOptions } from '#structures/tasks/Task';

@ApplyOptions<TaskOptions>({ cron: '* * * * *', immediate: true })
export class PresenceTask extends Task {
  activities: Generator<PresenceData, never>;

  constructor(context: PieceContext, options: TaskOptions) {
    super(context, options);
    this.activities = this._getActivity();
  }

  public override run(): void {
    this.container.client.user?.setPresence(this.activities.next().value);
  }

  private * _getActivity(): Generator<PresenceData, never> {
    let i = 0;
    while (true) {
      yield {
        activities: [{
          type: ActivityType.Custom,
          name: 'custom',
          state: pupa(config.messages[i], { memberCount: this.container.client.guild.memberCount }),
        }],
        status: 'online',
      };
      i++;
      if (i >= config.messages.length)
        i = 0;
    }
  }
}
