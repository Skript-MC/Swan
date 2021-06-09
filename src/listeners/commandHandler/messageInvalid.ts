import { Listener } from 'discord-akairo';
import { DMChannel } from 'discord.js';
import type { Message, MessageReaction, User } from 'discord.js';
import jaroWinklerDistance from 'jaro-winkler';
import pupa from 'pupa';
import type { GuildMessage } from '@/app/types';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class MessageInvalidListener extends Listener {
  constructor() {
    super('messageInvalid', {
      event: 'messageInvalid',
      emitter: 'commandHandler',
    });
  }

  public async exec(globalMessage: Message): Promise<void> {
    if (globalMessage.channel instanceof DMChannel || !globalMessage.member)
      return;

    const message = globalMessage as GuildMessage;
    const command = await this.client.commandHandler.parseCommand(message);

    // If "command" is an empty object (= was not found)
    if (Object.keys(command).length === 0 && command.constructor === Object)
      return;

    const allCommands = this.client.commandHandler.categories.array().flatMap(cat => cat.array());

    // If the command has an exact match, then it was refused because of an inhibitor or a permission check,
    // so no need to show the message.
    if (allCommands.some(cmd => cmd.aliases.includes(command.alias)))
      return;

    const possibleCommandsAliases: string[] = [];

    for (const commandCandidate of allCommands) {
      const matchAliases = commandCandidate.aliases
        .some(alias => jaroWinklerDistance(alias, command.alias, { caseSensitive: false }) > 0.7);
      if (matchAliases)
        possibleCommandsAliases.push(commandCandidate.aliases[0]);
    }

    if (possibleCommandsAliases.length === 0)
      return;

    const botMessage = await message.channel.send(
      pupa(messages.miscellaneous.commandSuggestion, {
        command,
        commandList: `\`${possibleCommandsAliases.join('`, `')}\``,
      }),
    );

    const reactions = settings.miscellaneous.reactionNumbers;
    if (possibleCommandsAliases.length === 1) {
      await botMessage.react('✅');
    } else {
      for (let i = 0; i < reactions.length && i < possibleCommandsAliases.length; i++)
        await botMessage.react(reactions[i]);
    }

    const collector = botMessage
      .createReactionCollector((reaction: MessageReaction, user: User) => !user.bot
          && user.id === message.author.id
          && (reaction.emoji.name === '✅' || reactions.includes(reaction.emoji.name)))
      .once('collect', async (reaction) => {
        collector.stop();
        await botMessage.delete().catch(noop);
        const index = reaction.emoji.name === '✅' ? 0 : reactions.indexOf(reaction.emoji.name);
        const finalCommandAlias = possibleCommandsAliases[index];

        message.content = `${this.client.commandHandler.prefix}${finalCommandAlias} ${command.content}`;
        message.createdTimestamp = Date.now();
        await this.client.commandHandler.handle(message);
      });
  }
}

export default MessageInvalidListener;
