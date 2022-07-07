import type { ChatInputCommand } from '@sapphire/framework';
import type {
 ApplicationCommandOptionData,
  AutocompleteInteraction,
  Collection,
  CommandInteraction,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type Task from '@/app/structures/tasks/Task';
import { Events } from '@/app/types/sapphire';
import { searchClosestTask } from '@/app/utils';
import { runTask as config } from '@/conf/commands/admin';

@ApplySwanOptions(config)
export default class RunTaskCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'tâche',
      description: 'Tâche à exécuter immédiatement',
      required: true,
      autocomplete: true,
    },
  ];

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const tasks = this._getExecutableTasks();
    const search = searchClosestTask([...tasks.values()], interaction.options.getString('tâche'));
    await interaction.respond(
      search
        .slice(0, 20)
        .map(entry => ({
          name: entry.matchedName,
          value: entry.baseName,
        })),
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('tâche'));
  }

  private async _exec(interaction: CommandInteraction, taskName: string): Promise<void> {
    const tasks = this._getExecutableTasks();
    const task = tasks.get(taskName);
    if (!task) {
      await interaction.reply(config.messages.unknownTask);
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      await task.run();
    } catch (error: unknown) {
      this.container.client.emit(Events.TaskError, error as Error, { piece: this });
      await interaction.followUp({ content: config.messages.taskError, ephemeral: true });
      return;
    }
    await interaction.followUp({ content: config.messages.success, ephemeral: true });
  }

  private _getExecutableTasks(): Collection<string, Task> {
    return this.container.client.stores.get('tasks')
      .filter(task => task.startupOrder != null || task.cron != null || task.interval != null);
  }
}
