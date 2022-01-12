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

  constructor(context: PieceContext, options: SwanCommandOptions) {
    super(context, { ...options, chatInputCommand: { register: true } });

    if (options.usage)
      this.usage = options.usage;
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
    registry.registerChatInputCommand({
      name: this.aliases[0],
      description: this.description,
      type: ApplicationCommandTypes.CHAT_INPUT,
      options: this.commandOptions,
    }, {
      guildIds: [process.env.GUILD_ID],
      behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
    });
  }
}
