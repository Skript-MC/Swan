import type { ApplicationCommandRegistry, PieceContext } from '@sapphire/framework';
import { Command, RegisterBehavior } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';
import type { SwanCommandOptions } from '@/app/types';

export default abstract class SwanCommand extends Command {
  command = '';
  usage = '';
  description = '';
  examples: string[] = [];
  permissions: string[] = [];
  commandOptions: ApplicationCommandOptionData[];
  private _category = '';

  constructor(context: PieceContext, options: SwanCommandOptions) {
    super(context, { ...options, name: context.name });

    if (options.command)
      this.command = options.command;

    if (options.description)
      this.description = options.description;

    if (options.category)
      this.category = options.category;

    if (options.examples.length > 0)
      this.examples = options.examples;

    if (options.permissions?.length > 0)
      this.permissions = options.permissions;

    if (options.commandOptions)
      this.commandOptions = options.commandOptions;
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
    if (this.supportsChatInputCommands()) {
      registry.registerChatInputCommand({
        type: ApplicationCommandTypes.CHAT_INPUT,
        name: this.command,
        description: this.description,
        options: this.commandOptions,
      }, {
        guildIds: [process.env.GUILD_ID],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      });
    } else if (this.supportsContextMenuCommands()) {
      registry.registerContextMenuCommand({
        type: ApplicationCommandTypes.MESSAGE,
        name: this.name,
      }, {
        guildIds: [process.env.GUILD_ID],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      });
    }
  }

  public get category(): string {
    return this._category;
  }

  public set category(value: string) {
    this._category = value;
  }
}
