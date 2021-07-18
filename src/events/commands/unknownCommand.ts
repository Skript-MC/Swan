import type { UnknownCommandPayload } from '@sapphire/framework';
import { Event, Events } from '@sapphire/framework';

import { DMChannel } from 'discord.js';
import type { MessageReaction, User } from 'discord.js';
import jaroWinklerDistance from 'jaro-winkler';
import pupa from 'pupa';
import type SwanCommand from '@/app/structures/commands/SwanCommand';
import type SwanCommandStore from '@/app/structures/commands/SwanCommandStore';
import type { GuildMessage } from '@/app/types';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default class UnknownCommandEvent extends Event {
  public override async run(
    { message: globalMessage, commandPrefix, commandName }: UnknownCommandPayload,
  ): Promise<void> {
    if (globalMessage.channel instanceof DMChannel || !globalMessage.member)
      return;

    const message = globalMessage as GuildMessage;

    const allCommands = (this.context.stores.get('commands') as SwanCommandStore).array();
    const possibleCommands: SwanCommand[] = [];

    for (const commandCandidate of allCommands) {
      const matchAliases = commandCandidate.aliases
        .some(alias => jaroWinklerDistance(alias, commandName, { caseSensitive: false }) > 0.7);
      if (matchAliases)
        possibleCommands.push(commandCandidate);
    }

    if (possibleCommands.length === 0)
      return;

    const botMessage = await message.channel.send(
      pupa(messages.miscellaneous.commandSuggestion, {
        commandName,
        commandList: `\`${possibleCommands.map(cmd => cmd.aliases[0]).join('`, `')}\``,
      }),
    );

    const reactions = settings.miscellaneous.reactionNumbers;
    if (possibleCommands.length === 1) {
      await botMessage.react('✅');
    } else {
      for (let i = 0; i < reactions.length && i < possibleCommands.length; i++)
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
        const finalCommand = possibleCommands[index];
        const originalContent = message.content.replace(`${commandPrefix}${commandName}`, '');

        message.content = `${settings.bot.prefix}${finalCommand.aliases[0]} ${originalContent}`;
        message.createdTimestamp = Date.now();

        this.context.client.emit(Events.PreMessageParsed, message);
      });
  }
}
