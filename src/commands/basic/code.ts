import { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import { code as config } from '../../../config/commands/basic';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import type { CodeCommandArguments } from '../../types/CommandArguments';
import { noop } from '../../utils';

class CodeCommand extends Command {
  constructor() {
    super('code', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'code',
        type: 'string',
        match: 'content',
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: Message, args: CodeCommandArguments): Promise<void> {
    // FIXME: For now we just type-guard even though this will never happen, because we specified
    // "channel": "guild" in the config ; but the typings aren't changed so TS is complaining.
    if (message.channel.type !== 'text')
      return;

    try {
      message.util.messages.set(message.id, message);
      await message.channel.bulkDelete(message.util.messages, true).catch(noop);

      const titleMessage = await message.util.send(`**Code de ${message.member.displayName} :**`);
      const codeMessage = await message.util.sendNew(args.code, { code: 'applescript' });
      await codeMessage.react(settings.emojis.remove);

      const collector = codeMessage
        .createReactionCollector((reaction, user) => user.id === message.author.id
          && !user.bot
          && (reaction.emoji.id || reaction.emoji.name) === settings.emojis.remove)
        .on('collect', async () => {
          try {
            collector.stop();
            await titleMessage.delete();
            await codeMessage.delete();
          } catch {
            await message.util.send(messages.global.oops).catch(noop);
          }
        });
    } catch (unknownError: unknown) {
      await message.member.send(config.messages.emergency).catch(noop);
      await message.member.send(message.content).catch(noop);
      throw unknownError as Error;
    }
  }
}

export default CodeCommand;
