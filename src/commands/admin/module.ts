import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import pupa from 'pupa';
import { module as config } from '#config/commands/admin';
import { SwanModule } from '#models/swanModule';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { noop, toggleModule } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class ModuleCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      choices: [],
      name: 'module',
      description: 'Module à modifier son statut',
      required: true,
      autocomplete: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'statut',
      description: 'Faut-il activer ce module ?',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const moduleName = interaction.options.getString('module', true);
    const status = interaction.options.getBoolean('statut', true);
    await this._exec(interaction, moduleName, status);
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    moduleName: string,
    enabled: boolean,
  ): Promise<void> {
    const module = await SwanModule.findOne({ name: moduleName });
    if (!module) {
      await interaction.reply(config.messages.noModuleFound).catch(noop);
      return;
    }

    // TODO(interactions): Always show the current state for the given module, and add a toggle to
    // enable/disable it.

    await toggleModule(module, enabled);
    await SwanModule.findOneAndUpdate({ name: module.name }, { enabled });

    await interaction.reply(pupa(config.messages.success, { status: this._getStatus(enabled) })).catch(noop);
  }

  private _getStatus(status: boolean): string {
    return status ? config.messages.on : config.messages.off;
  }
}
