import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { runTask as config } from '#config/commands/admin';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { Events } from '#types/sapphire';
import { searchClosestTask } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class RunTaskCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'tâche',
      description: 'Tâche à exécuter immédiatement',
      required: true,
      autocomplete: true,
    },
  ];

  public override async autocompleteRun(
    interaction: SwanCommand.AutocompleteInteraction,
  ): Promise<void> {
    const tasks = this.container.client.stores.get('tasks');
    const search = searchClosestTask(
      [...tasks.values()],
      interaction.options.getString('tâche', true),
    );
    await interaction.respond(
      search.slice(0, 20).map((entry) => ({
        name: entry.matchedName,
        value: entry.baseName,
      })),
    );
  }

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('tâche', true));
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    taskName: string,
  ): Promise<void> {
    const tasks = this.container.client.stores.get('tasks');
    const task = tasks.get(taskName);
    if (!task) {
      await interaction.reply(config.messages.unknownTask);
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      await task.run();
    } catch (error: unknown) {
      this.container.client.emit(Events.TaskError, error as Error, {
        piece: this,
      });
      await interaction.followUp(config.messages.taskError);
      return;
    }
    await interaction.followUp({
      content: config.messages.success,
      ephemeral: true,
    });
  }
}
