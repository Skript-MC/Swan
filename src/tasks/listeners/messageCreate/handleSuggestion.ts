import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import SuggestionManager from '@/app/structures/SuggestionManager';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import { handleSuggestion as config } from '@/conf/tasks/listeners/messageCreate';

@ApplyOptions<TaskOptions>(config.settings)
export default class HandleSuggestionTask extends MessageTask {
  public async runListener(message: Message): Promise<boolean> {
    if (message.channel.id === settings.channels.suggestions) {
      await message.delete();
      const response = await SuggestionManager.publishSuggestion(message.content, message.author.id);
      if (response?.status === 'PUBLISHED') {
        const suggestionEmbed = await SuggestionManager.getSuggestionEmbed(response.suggestion);
        const suggestionActions = SuggestionManager.getSuggestionActions(response.suggestion);
        const suggestionMessage = await message.channel.send({
          embeds: [suggestionEmbed],
          components: [suggestionActions],
        });
        const thread = await suggestionMessage.startThread({
          name: `Suggestion ${response.suggestion.id} de ${response.suggestion.user.username}`,
        });
        if (response.suggestion.user.discordId)
          await thread.members.add(response.suggestion.user.discordId);
        await SuggestionManager.suggestionCallback(response.suggestion, suggestionMessage);
        const embed = new MessageEmbed()
          .setColor(settings.colors.success)
          .setTitle(messages.suggestions.published.title)
          .setDescription(messages.suggestions.published.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: settings.bot.avatar });
        await message.author.send({ embeds: [embed] });
        return false;
      } else if (response?.status === 'UNLINKED') {
        const embed = new MessageEmbed()
          .setColor(settings.colors.error)
          .setTitle(messages.suggestions.unlinked.title)
          .setDescription(messages.suggestions.unlinked.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: settings.bot.avatar });
        const actions = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setLabel(messages.suggestions.loginButton)
              .setURL(response.loginUrl)
              .setStyle('LINK'),
          );
        await message.author.send({ embeds: [embed], components: [actions] });
      } else {
        const embed = new MessageEmbed()
          .setColor(settings.colors.error)
          .setTitle(messages.suggestions.error.title)
          .setDescription(messages.suggestions.error.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: settings.bot.avatar });
        await message.author.send({ embeds: [embed] });
      }
    }
    return false;
  }
}
