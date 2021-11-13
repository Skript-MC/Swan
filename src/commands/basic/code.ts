import { ApplyOptions } from '@sapphire/decorators';
import type { Message, MessageReaction, User } from 'discord.js';
import { Formatters } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage } from '@/app/types';
import { CodeCommandArguments } from '@/app/types/CommandArguments';
import { noop, splitText } from '@/app/utils';
import { code as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

const displayLinesFlag = ['-l', '--line', '--lines', '--ligne', '--lignes'];
const startLinesAtOption = ['-s=', '--start='];
const languageOption = ['-l=', '--language=', '--langage='];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  flags: displayLinesFlag,
  options: [startLinesAtOption, languageOption].flat(),
})
export default class CodeCommand extends SwanCommand {
  @Arguments({
    name: 'displayLines',
    match: 'flag',
    flags: displayLinesFlag,
  }, {
    name: 'startLinesAt',
    match: 'option',
    flags: startLinesAtOption,
    type: 'integer',
    default: 0,
  }, {
    name: 'language',
    match: 'option',
    flags: languageOption,
    default: 'applescript',
  }, {
    name: 'code',
    match: 'rest',
    type: 'string',
    required: true,
    message: messages.prompt.code,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: CodeCommandArguments): Promise<void> {
    try {
      await message.delete();

      // Add the lines at the beginning, if needed.
      let { code } = args;
      if (args.displayLines) {
        const lines = code.split('\n');
        code = '';
        // Compute the last line to know its length.
        const finalLine = (args.startLinesAt + lines.length).toString();
        for (const [i, line] of lines.entries()) {
          // Compute current line index.
          const currentLine = (args.startLinesAt + i + 1).toString();
          // Compute the space needed between the last number and the separator ('|').
          const space = finalLine.length - currentLine.length;
          code += `\n${args.startLinesAt + i + 1}${' '.repeat(space)} | ${line}`;
        }
      }

      // Send the message by splitting the code into blocks that are 2000 characters long max.
      const titleMessage = await message.channel.send(pupa(config.messages.title, { message }));
      const splitCode = splitText(code, 1980);
      const codeBlocks: Message[] = [];

      for (let i = 0; i < splitCode.length; i++)
        codeBlocks.push(await message.channel.send(Formatters.codeBlock(args.language, splitCode[i])));

      const lastMessage = codeBlocks[codeBlocks.length - 1];
      await lastMessage?.react(settings.emojis.remove).catch(noop);

      const collector = lastMessage
        .createReactionCollector({
          filter: (reaction: MessageReaction, user: User) => user.id === message.author.id
            && !user.bot
            && (reaction.emoji.id ?? reaction.emoji.name) === settings.emojis.remove,
        }).on('collect', async () => {
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
      await message.member.send(message.content).catch(noop);
      throw unknownError as Error;
    }
  }
}
