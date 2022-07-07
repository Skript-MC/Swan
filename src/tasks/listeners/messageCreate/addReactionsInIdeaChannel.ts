import { ApplyOptions } from '@sapphire/decorators';
import { Permissions } from 'discord.js';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import type { GuildMessage } from '@/app/types';
import settings from '@/conf/settings';
import { addReactionsInIdeaChannel as config } from '@/conf/tasks/listeners/messageCreate';

@ApplyOptions<TaskOptions>(config.settings)
export default class AddReactionsInIdeaChannelTask extends MessageTask {
  public async runListener(message: GuildMessage): Promise<boolean> {
    if (message.channel.id === settings.channels.idea) {
      try {
        await message.react(settings.emojis.yes);
        await message.react(settings.emojis.no);
      } catch (unknownError: unknown) {
        this.container.logger.error('Unable to add emojis to the idea channel.');
        this.container.logger.info(`Has "ADD_REACTION" permission: ${message.guild.me?.permissionsIn(message.channel).has(Permissions.FLAGS.ADD_REACTIONS)}`);
        this.container.logger.info(`Emojis added: "${settings.emojis.yes}" + "${settings.emojis.no}"`);
        this.container.logger.info(`Idea channel ID/Current channel ID: ${settings.channels.idea}/${message.channel.id} (same=${settings.channels.idea === message.channel.id})`);
        this.container.logger.info(`Message: ${message.url}`);
        this.container.logger.error((unknownError as Error).stack);
      }
    }
    return false;
  }
}
