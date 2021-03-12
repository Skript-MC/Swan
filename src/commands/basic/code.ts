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
      // Add the message to the current-command-messages' store, to then bulk-delete them all.
      message.util.messages.set(message.id, message);
      await message.channel.bulkDelete(message.util.messages, true).catch(noop);

      // Validate the "startAtLine" option.
      let startAtLine = 0;
      if (args.displayLines && args.startLinesAt) {
        const value = Number.parseInt(args.startLinesAt, 10);
        if (!Number.isNaN(value))
          startAtLine = Math.max(value - 1, 0);
      }

      // Add the lines at the beginning, if needed.
      let { code } = args;
      if (args.displayLines) {
        const lines = code.split('\n');
        code = '';
        // Compute the last line to know its length.
        const finalLine = (startAtLine + lines.length).toString();
        for (const [i, line] of lines.entries()) {
          // Compute current line index.
          const currentLine = (startAtLine + i + 1).toString();
          // Compute the space needed between the last number and the separator ('|').
          const space = finalLine.length - currentLine.length;
          code += `\n${startAtLine + i + 1}${' '.repeat(space)} | ${line}`;
        }
      }

      // Send the message by splitting the code into blocks that are 2000 characters long max.
      const titleMessage = await message.channel.send(pupa(config.messages.title, { message }));
      const splitCode = splitText(code, 1980);
      const codeBlocks: Message[] = [];

      const language = args.language ?? 'applescript';

      for (let i = 0; i < splitCode.length; i++)
        codeBlocks.push(await message.channel.send(splitCode[i], { code: language }));

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
      // Send back all the messages the user sent, in case something went wrong.
      await message.member.send(config.messages.emergency).catch(noop);
      const userMessages = message.util.messages
        .array()
        .filter(msg => !msg.author.bot);
      for (const userMessage of userMessages)
        await message.member.send(userMessage.content).catch(noop);
      throw unknownError as Error;
    }
  }
}

export default CodeCommand;
