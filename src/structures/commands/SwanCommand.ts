import type {
  ApplicationCommandRegistry,
  ApplicationCommandRegistryRegisterOptions,
  PieceContext,
} from '@sapphire/framework';
import { Command, RegisterBehavior } from '@sapphire/framework';
import type {
  ApplicationCommandOptionData,
  CacheType,
  CommandInteraction as DjsCommandInteraction,
  ModalSubmitInteraction as DjsModalSubmitInteraction,
} from 'discord.js';
import { ApplicationCommandType } from 'discord.js';
import type { SwanCommandOptions } from '@/app/types';

const REGISTRY_OPTIONS: ApplicationCommandRegistryRegisterOptions = {
  guildIds: [process.env.GUILD_ID],
  behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
};

export abstract class SwanCommand extends Command {
  commandName = '';
  command = '';
  usage = '';
  description = '';
  examples: string[] = [];
  permissions: string[] = [];

  abstract commandOptions: ApplicationCommandOptionData[];
  abstract commandType: ApplicationCommandType;

  constructor(context: PieceContext, options: SwanCommand.Options) {
    super(context, { ...options, name: context.name });

    if (options.name)
      this.commandName = options.name;

    if (options.command)
      this.command = options.command;

    if (options.description)
      this.description = options.description;

    if (options.examples.length > 0)
      this.examples = options.examples;

    if (options.permissions?.length > 0)
      this.permissions = options.permissions;
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
    switch (this.commandType) {
      case ApplicationCommandType.ChatInput:
        console.log('Registering chat input command', this.command);
        registry.registerChatInputCommand({
          type: ApplicationCommandType.ChatInput,
          name: this.command,
          description: this.description,
          options: this.commandOptions,
        }, REGISTRY_OPTIONS);
        break;
      case ApplicationCommandType.User:
        registry.registerContextMenuCommand({
          type: ApplicationCommandType.User,
          name: this.commandName,
        }, REGISTRY_OPTIONS);
        break;
      case ApplicationCommandType.Message:
        registry.registerContextMenuCommand({
          type: ApplicationCommandType.Message,
          name: this.commandName,
        }, REGISTRY_OPTIONS);
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
  export type MessageInteraction<Cached extends CacheType = CacheType> = Command.ContextMenuCommandInteraction<Cached>;
  export type ContextMenuInteraction<Cached extends CacheType = CacheType> =
    Command.ContextMenuCommandInteraction<Cached>;
  export type AutocompleteInteraction<Cached extends CacheType = CacheType> = Command.AutocompleteInteraction<Cached>;
  export type CommandInteraction<Cached extends CacheType = CacheType> = DjsCommandInteraction<Cached>;
  export type ModalSubmitInteraction<Cached extends CacheType = CacheType> = DjsModalSubmitInteraction<Cached>;
  export type Registry = Command.Registry;
}
