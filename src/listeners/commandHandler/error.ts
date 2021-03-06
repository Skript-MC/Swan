import { Listener } from 'discord-akairo';
import type { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import Logger from '@/app/structures/Logger';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';

class CommandHandlerErrorListener extends Listener {
  constructor() {
    super('commandHandlerError', {
      event: 'error',
      emitter: 'commandHandler',
    });
  }

  public async exec(error: Error, message: Message, command: Command): Promise<void> {
    await message.channel.send(messages.global.oops).catch(noop);
    Logger.error('Oops, something went wrong with a command!');
    Logger.detail(`Command: ${command}`);
    Logger.detail(`Message: ${message.url}`);

    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      Logger.error(error.stack);
  }
}

export default CommandHandlerErrorListener;
