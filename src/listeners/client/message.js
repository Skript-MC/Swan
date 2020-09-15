import { Listener } from 'discord-akairo';
import { DMChannel, Permissions } from 'discord.js';
import settings from '../../../config/settings';

class MessageListener extends Listener {
  constructor() {
    super('message', {
      event: 'message',
      emitter: 'client',
    });
  }

  async addReactionsInIdeaChannel(message) {
    if (message.channel.id === settings.channels.idea) {
      try {
        await message.react(settings.emojis.yes);
        await message.react(settings.emojis.no);
      } catch (error) {
        this.client.logger.error('Unable to add emojis to the idea channel.');
        this.client.logger.detail(`Has "ADD_REACTION" permission: ${message.guild.me.permissionsIn(message.channel).has(Permissions.FLAGS.ADD_REACTIONS)}`);
        this.client.logger.detail(`Emojis added: "${settings.emojis.yes}" + "${settings.emojis.no}"`);
        this.client.logger.detail(`Idea channel ID/Current channel ID: ${settings.channels.idea}/${message.channel.id} (same=${settings.channels.idea === message.channel.id})`);
        this.client.logger.detail(`Message: ${message.url}`);
        this.client.logger.error(error.stack);
      }
    }
    return false;
  }

  async* getTasks(message) {
    yield await this.addReactionsInIdeaChannel(message);
  }

  async exec(message) {
    const isCommand = this.client.commandHandler.parseWithPrefix(message, '=').command;
    if (isCommand)
      return;
    if (message.author.bot || message.system || message.channel instanceof DMChannel)
      return;

    // Run all needed tasks, and stop when there is either no more tasks or
    // when one returned true (= want to stop)
    let task = { done: false };
    const tasks = this.getTasks(message);

    while (!task.done) {
      if (task.value)
        break;
      task = await tasks.next(); // eslint-disable-line no-await-in-loop
    }
  }
}

export default MessageListener;
