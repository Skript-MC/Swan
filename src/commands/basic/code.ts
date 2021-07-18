import { ApplyOptions } from '@sapphire/decorators';
import type { Args, Argument } from '@sapphire/framework';
import type { Message, MessageReaction, User } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop, splitText } from '@/app/utils';
import { code as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

const lineFlags = ['line', 'lines', 'l'];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  strategyOptions: {
    flags: [...lineFlags],
    options: ['lang', 'language', 'start', 's'],
  },
})
export default class CodeCommand extends SwanCommand {
  // [{
  //   id: 'code',
  //   type: 'string',
  //   match: 'rest',
  //   prompt: {
  //     start: config.messages.startPrompt,
  //     retry: config.messages.retryPrompt,
  //   },
  // }, {
  //   id: 'displayLines',
  //   match: 'flag',
  //   flag: ['-l', '--line', '--lines', '--ligne', '--lignes'],
  // }, {
  //   id: 'startLinesAt',
  //   match: 'option',
  //   flag: ['-s=', '--start='],
  // }, {
  //   id: 'language',
  //   match: 'option',
  //   flag: ['--lang=', '--language=', '--langage='],
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    const displayLines = args.getFlags(...['line', 'lines', 'l']);
    const startAtLine = await this._getStartLine(message, args);
    const language = args.getOption('lang', 'language') ?? 'applescript';

    try {
      // Add the message to the current-command-messages' store, to then bulk-delete them all.
      // message.util.messages.set(message.id, message);
      // await message.channel.bulkDelete(message.util.messages, true).catch(noop);

      // Add the lines at the beginning, if needed.
      const codeResult = await args.restResult('string');
      if (codeResult.error)
        return void await message.channel.send(config.messages.retryPrompt);

      await message.delete();

      let code = codeResult?.value;
      if (displayLines) {
        const lines = codeResult.value.split('\n');
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
      // Const userMessages = message.util.messages
      //   .array()
      //   .filter(msg => !msg.author.bot);
      // for (const userMessage of userMessages)
        // await message.member.send(userMessage.content).catch(noop);
      await message.member.send(message.content).catch(noop);
      throw unknownError as Error;
    }
  }

  private async _getStartLine(message: GuildMessage, args: Args): Promise<number> {
    const option = args.getOption('start', 's');
    if (!option)
      return 0;

    const integer = this.context.stores.get('arguments').get('integer') as Argument<number>;
    const startAtLine = await integer
      .run(option, {
        args,
        argument: integer,
        message,
        command: this,
        commandContext: args.commandContext,
        minimum: 0,
      });
    if (startAtLine.success)
      return startAtLine.value - 1;
    return 0;
  }
}
