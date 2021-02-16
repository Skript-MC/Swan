import { Command } from 'discord-akairo';
import type { Message, MessageReaction, User } from 'discord.js';
import pupa from 'pupa';
import type { GuildMessage } from '@/app/types';
import type { CodeCommandArguments } from '@/app/types/CommandArguments';
import { noop, splitText } from '@/app/utils';
import { code as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class CodeCommand extends Command {
  constructor() {
    super('code', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'code',
        type: 'string',
        match: 'rest',
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      }, {
        id: 'displayLines',
        match: 'flag',
        flag: ['-l', '--line', '--lines', '--ligne', '--lignes'],
      }, {
        id: 'startLinesAt',
        match: 'option',
        flag: ['-s=', '--start='],
      }, {
        id: 'language',
        match: 'option',
        flag: ['--lang=', '--language=', '--langage='],
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: CodeCommandArguments): Promise<void> {
    try {
      message.util.messages.set(message.id, message);
      await message.channel.bulkDelete(message.util.messages, true).catch(noop);

      let startAtLine = 0;
      if (args.displayLines && args.startLinesAt) {
        const value = Number.parseInt(args.startLinesAt, 10);
        if (!Number.isNaN(value))
          startAtLine = Math.max(value - 1, 0);
      }

      let { code } = args;
      if (args.displayLines) {
        const lines = code.split('\n');
        code = '';
        for (const [i, line] of lines.entries()) {
          const finalLine = (startAtLine + lines.length).toString();
          const currentLine = (startAtLine + i + 1).toString();
          const space = finalLine.length - currentLine.length;
          code += `\n${startAtLine + i + 1}${' '.repeat(space)} | ${line}`;
        }
      }

      const titleMessage = await message.channel.send(pupa(config.messages.title, { message }));
      const splittedCode = splitText(code);
      const codeBlocks: Message[] = [];

      let language = 'applescript';
      if (args.language)
        language = args.language;

      for (let i = 0; i < splittedCode.length; i++)
        codeBlocks.push(await message.channel.send(splittedCode[i], { code: language }));

      const lastMessage = codeBlocks[codeBlocks.length - 1];
      await lastMessage?.react(settings.emojis.remove).catch(noop);

      const collector = lastMessage
        .createReactionCollector((reaction: MessageReaction, user: User) => user.id === message.author.id
          && !user.bot
          && (reaction.emoji.id ?? reaction.emoji.name) === settings.emojis.remove)
        .on('collect', async () => {
          try {
            collector.stop();
            await titleMessage.delete();
            for (const block of codeBlocks)
              await block.delete().catch(noop);
          } catch {
            await message.channel.send(messages.global.oops).catch(noop);
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
