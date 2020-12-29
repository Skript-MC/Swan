import type { PresenceData } from 'discord.js';
import settings from '../../config/settings';
import Task from '../structures/Task';

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
    while (true) {
      // TODO: Move this in config/settings.js?
      yield { activity: { name: `${this.client.guild.memberCount} membres 🎉`, type: 'WATCHING' }, status: 'online' };
      yield { activity: { name: `${settings.bot.prefix}aide | Skript-MC`, type: 'WATCHING' }, status: 'online' };
    }
  }
}

export default PresenceTask;
