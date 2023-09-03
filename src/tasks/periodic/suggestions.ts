import { ApplyOptions } from '@sapphire/decorators';
import * as SuggestionManager from '@/app/structures/SuggestionManager';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import { Task } from '@/app/structures/tasks/Task';
import { channels } from '@/conf/settings';

@ApplyOptions<TaskOptions>({ cron: '*/20 * * * *' })
export class SuggestionsTask extends Task {
  public override async run(): Promise<void> {
    await this._syncSuggestions();
  }

  private async _syncSuggestions(): Promise<void> {
    // Get all the suggestions waiting to be sent/updated
    const suggestions = await SuggestionManager.getPendingSuggestions();

    const channel = this.container.client.channels.cache.get(channels.suggestions);
    if (!suggestions || !channel?.isTextBased())
      return;

    for (const suggestion of suggestions) {
      // Get embed and actions for this suggestion
      const embed = await SuggestionManager.getSuggestionEmbed(suggestion);
      const actions = SuggestionManager.getSuggestionActions(suggestion);

      let message;
      if (suggestion.discordId) {
        // The suggestion has a discordId, so we need to update the suggestion
        message = await channel.messages.fetch(suggestion.discordId);
        await message.edit({
          embeds: [embed],
          components: [actions],
        });
      } else {
        // Send the message and store it
        message = await channel.send({
          embeds: [embed],
          components: [actions],
        });
        const thread = await message.startThread({
          name: `Suggestion ${suggestion.id} de ${suggestion.user.username}`,
        });
        if (suggestion.user.discordId)
          await thread.members.add(suggestion.user.discordId);
      }

      // Acknowledge the suggestion update
      await SuggestionManager.suggestionCallback(suggestion, message);
    }
  }
}
