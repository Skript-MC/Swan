import type { ApplicationCommandRegistry, PieceContext } from '@sapphire/framework';
import { Command, RegisterBehavior } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CacheType, CommandInteraction as DjsCommandInteraction } from 'discord.js';
import { ApplicationCommandType } from 'discord.js';
import type { SwanCommandOptions } from '@/app/types';

export abstract class SwanCommand extends Command {
  command = '';
  usage = '';
  description = '';
  examples: string[] = [];
  permissions: string[] = [];
  commandOptions: ApplicationCommandOptionData[];

  constructor(context: PieceContext, options: SwanCommand.Options) {
    super(context, { ...options, name: context.name });

    if (options.command)
      this.command = options.command;

    if (options.description)
      this.description = options.description;

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
        type: ApplicationCommandType.ChatInput,
        name: this.command,
        description: this.description,
        options: this.commandOptions,
      }, {
        guildIds: [process.env.GUILD_ID],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      });
    } else if (this.supportsContextMenuCommands()) {
      registry.registerContextMenuCommand({
        type: ApplicationCommandType.Message,
        name: this.name,
      }, {
        guildIds: [process.env.GUILD_ID],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      });
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-redeclare
export namespace SwanCommand {
  export type Options = Command.Options & SwanCommandOptions;
  export type JSON = Command.JSON;
  export type Context = Command.Context;
  export type RunInTypes = Command.RunInTypes;
  export type ChatInputInteraction<Cached extends CacheType = CacheType> = Command.ChatInputCommandInteraction<Cached>;
  export type ContextMenuInteraction<Cached extends CacheType = CacheType> =
    Command.ContextMenuCommandInteraction<Cached>;
  export type AutocompleteInteraction<Cached extends CacheType = CacheType> = Command.AutocompleteInteraction<Cached>;
  export type CommandInteraction<Cached extends CacheType = CacheType> = DjsCommandInteraction<Cached>;
  export type Registry = Command.Registry;
}
