import type { PresenceData } from 'discord.js';
import pupa from 'pupa';
import Task from '@/app/structures/Task';
import settings from '@/conf/settings';
import { presence as config } from '@/conf/tasks';

class PresenceTask extends Task {
  activities: Generator<PresenceData, never>;

  constructor() {
    super('presence', {
      // Every minute
      cron: '* * * * *',
    });
    this.activities = this._getActivity();
  }

  public async exec(): Promise<void> {
    await this.client.user.setPresence(this.activities.next().value);
  }

  private * _getActivity(): Generator<PresenceData, never> {
    let i = 0;
    while (true) {
      yield {
        activity: {
          name: pupa(config.messages[i], {
            memberCount: this.client.guild.memberCount,
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

export default PresenceTask;
