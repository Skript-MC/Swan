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
  MessageApplicationCommandData,
  PermissionResolvable,
  UserApplicationCommandData,
} from 'discord.js';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord.js';
import type { SwanCommandOptions } from '@/app/types';

const REGISTRY_OPTIONS: ApplicationCommandRegistryRegisterOptions = {
  guildIds: [process.env.GUILD_ID],
  behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
};

export abstract class SwanCommand extends Command {
  public command: string;
  public dmPermission: boolean;
  public defaultMemberPermissions: PermissionResolvable;

  abstract commandOptions: ApplicationCommandOptionData[];
  abstract commandType: ApplicationCommandType;

  constructor(context: PieceContext, options: SwanCommand.Options) {
    super(context, {
      ...options,
      name: options.command,
      description: options.description,
    });

    this.command = options.command;
    this.description = options.description;
    this.dmPermission = options.dmPermission ?? false;
    this.defaultMemberPermissions = options.defaultMemberPermissions ?? PermissionFlagsBits.SendMessages;
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
    switch (this.commandType) {
      case ApplicationCommandType.ChatInput:
        registry.registerChatInputCommand({
          name: this.command,
          description: this.description,
          options: this.commandOptions,
          dmPermission: this.dmPermission,
          defaultMemberPermissions: this.defaultMemberPermissions,
        }, REGISTRY_OPTIONS);
        break;

      case ApplicationCommandType.User:
      case ApplicationCommandType.Message:
        registry.registerContextMenuCommand({
          type: this.commandType,
          name: this.command,
        } as MessageApplicationCommandData | UserApplicationCommandData, REGISTRY_OPTIONS);
        break;
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
