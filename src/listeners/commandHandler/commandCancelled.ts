import { Listener } from 'discord-akairo';
import type { GuildMessage } from '@/app/types';
import { noop } from '@/app/utils';
import settings from '@/conf/settings';

class CommandCancelledListener extends Listener {
  constructor() {
    super('commandCancelled', {
      event: 'commandCancelled',
      emitter: 'commandHandler',
    });
  }

  public async exec(message: GuildMessage): Promise<void> {
    if (message.channel.id !== settings.channels.bot) {
      message.util.messages.set(message.id, message);
      await message.channel.bulkDelete(message.util.messages, true).catch(noop);
    }
  }
}

export default CommandCancelledListener;
