import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import RefreshCommand from '@/app/commands/admin/refresh';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { noop, toggleModule } from '@/app/utils';
import { module as config } from '@/conf/commands/admin';

@ApplySwanOptions(config)
export default class ModuleCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      choices: [],
      name: 'module',
      description: 'Module à modifier son statut',
      required: true,
      autocomplete: false,
    },
    {
      type: ApplicationCommandOptionTypes.BOOLEAN,
      name: 'statut',
      description: 'Faut-il activer ce module ?',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const moduleName = interaction.options.getString('module');
    const status = interaction.options.getBoolean('statut');
    await this._exec(interaction, moduleName, status);
  }

  private async _exec(interaction: CommandInteraction, moduleName: string, enabled: boolean): Promise<void> {
    const module = await SwanModule.findOne({ name: moduleName });
    if (!module) {
      await interaction.reply(config.messages.noModuleFound).catch(noop);
      return;
    }

    // TODO(interactions): Always show the current state for the given module, and add a toggle to
    // enable/disable it (unless it's the RefreshCommand).
    if (!enabled && module.name === RefreshCommand.name) {
      await interaction.reply(config.messages.cannotBeDisabled).catch(noop);
      return;
    }

    await toggleModule(module, enabled);
    await SwanModule.findOneAndUpdate({ name: module.name }, { enabled });

    await interaction.reply(pupa(config.messages.success, { status: this._getStatus(enabled) })).catch(noop);
  }

  private _getStatus(status: boolean): string {
    return status ? config.messages.on : config.messages.off;
  }
}
