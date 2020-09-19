import { Command } from 'discord-akairo';
import { code as config } from '../../../config/commands/basic';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import { noop } from '../../utils';

class CodeCommand extends Command {
  constructor() {
    super('code', {
      aliases: config.settings.aliases,
      description: { ...config.description },
      args: [{
        id: 'code',
        type: 'string',
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  async exec(message, args) {
    try {
      message.delete();
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
            titleMessage.delete();
            codeMessage.delete();
          } catch {
            await message.util.send(messages.global.oops).catch(noop);
          }
        });
    } catch (err) {
      await message.util.send(messages.global.oops).catch(noop);
      await message.member.send(config.messages.emergency).catch(noop);
      await message.member.send(message.content).catch(noop);
      throw err;
    }
  }
}

export default CodeCommand;
