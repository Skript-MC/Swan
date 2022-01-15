import type { ApplicationCommandRegistry, PieceContext } from '@sapphire/framework';
import { Command, RegisterBehavior } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';
import type { SwanCommandOptions } from '@/app/types';

export default abstract class SwanCommand extends Command {
  usage = '';
  description = '';
  examples: string[] = [];
  permissions: string[] = [];
  commandOptions: ApplicationCommandOptionData[];
  commandType: ApplicationCommandTypes;

  constructor(context: PieceContext, options: SwanCommandOptions) {
    super(context, { ...options, chatInputCommand: { register: true } });

    if (options.description)
      this.description = options.description;

    if (options.examples.length > 0)
      this.examples = options.examples;

    if (options.permissions?.length > 0)
      this.permissions = options.permissions;

    if (options.commandOptions)
      this.commandOptions = options.commandOptions;

    if (options.commandType)
      this.commandType = options.commandType;
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
    switch (this.commandType) {
      case ApplicationCommandTypes.CHAT_INPUT:
        registry.registerChatInputCommand({
          type: ApplicationCommandTypes.CHAT_INPUT,
          name: this.aliases[0],
          description: this.description,
          options: this.commandOptions,
        }, {
          guildIds: [process.env.GUILD_ID],
          behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
        break;
      case ApplicationCommandTypes.MESSAGE:
        registry.registerContextMenuCommand({
          type: ApplicationCommandTypes.MESSAGE,
          name: 'string',
          defaultPermission: false,
        }, {
          guildIds: [process.env.GUILD_ID],
          behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
        break;
      case ApplicationCommandTypes.USER:
        throw new Error('Not implemented yet: ApplicationCommandTypes.USER case');
    }
  }
}
