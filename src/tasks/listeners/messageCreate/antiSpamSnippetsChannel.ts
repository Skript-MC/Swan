import { ApplyOptions } from '@sapphire/decorators';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import type { GuildMessage } from '@/app/types';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import { antiSpamSnippetsChannel as config } from '@/conf/tasks/listeners/messageCreate';

@ApplyOptions<TaskOptions>(config.settings)
export default class AddReactionsInIdeaChannelTask extends MessageTask {
  public async runListener(message: GuildMessage): Promise<boolean> {
    if (message.channel.id === settings.channels.snippets
      && !message.member.roles.cache.has(settings.roles.staff)) {
      // We check that they are not the author of the last message in case they exceed the 2.000 chars limit
      // and they want to add details or informations.
      try {
        const previousAuthorId = await message.channel.messages
          .fetch({ before: message.channel.lastMessageId, limit: 1 })
          .then(elt => elt.first()?.author.id);
        if (previousAuthorId !== message.author.id && !/```(?:.|\n)*```/gmu.test(message.content)) {
          await message.delete();
          await message.member.send(messages.miscellaneous.noSpam);
          await message.member.send(message.content);
        }
      } catch { /* Ignored */ }
    }
    return false;
  }
}
