import { ApplyOptions } from '@sapphire/decorators';
import type SwanClient from '@/app/SwanClient';
import SuggestionManager from '@/app/structures/SuggestionManager';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import settings from '@/conf/settings';

@ApplyOptions<TaskOptions>({ cron: '* * * * *', immediate: true })
export default class SuggestionsTask extends Task {
  public override async run(): Promise<void> {
    await this._syncSuggestions();
  }

  private async _syncSuggestions(): Promise<void> {
    // Get all the suggestions waiting to be sent/updated
    const suggestions = await SuggestionManager.getPendingSuggestions();

    const channel = this.container.client.channels.cache.get(settings.channels.suggestions);
    if (!suggestions || !channel?.isText())
      return;

    for (const suggestion of suggestions) {
      const { client } = this.container;

      // Get embed and actions for this suggestion
      const embed = await SuggestionManager.getSuggestionEmbed(client as SwanClient, suggestion);
      const actions = SuggestionManager.getSuggestionActions(client as SwanClient, suggestion);

      let message;
      if (suggestion.discordId) {
        // The suggestion has a discordId, so we need to update the suggestion
        message = await channel.messages.fetch(suggestion.discordId);
        await message.edit({ embeds: [embed], components: [actions] });
      } else {
        // Send the message and store it
        message = await channel.send({ embeds: [embed], components: [actions] });
      }

      // Acknowledge the suggestion update
      await SuggestionManager.suggestionCallback(suggestion, message);
    }
  }
}
