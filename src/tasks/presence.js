import settings from '../../config/settings';
import Task from '../structures/Task';

class PresenceTask extends Task {
  constructor() {
    super('presence', {
      // Every minute
      cron: '* * * * *',
    });
    this.activities = this.getActivity();
  }

  * getActivity() {
    while (true) {
      // TODO: Move this in config/settings.js?
      yield { activity: { name: `${this.client.guild.memberCount} membres 🎉`, type: 'WATCHING' }, status: 'online' };
      yield { activity: { name: `${settings.bot.prefix}aide | Skript-MC`, type: 'WATCHING' }, status: 'online' };
    }
  }

  exec() {
    this.client.user.setPresence(this.activities.next().value);
  }
}

export default PresenceTask;
