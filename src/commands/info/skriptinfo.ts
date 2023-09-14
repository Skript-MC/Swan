import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import semver from 'semver';
import { skriptInfo as config } from '#config/commands/info';
import { colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class SkriptInfoCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'Téléchargements',
          value: 'téléchargements',
        },
        {
          name: 'Liens utiles',
          value: 'liens utiles',
        },
      ],
      name: 'catégorie',
      description: 'Catégorie pertinente à envoyer',
      required: false,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('catégorie'));
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, display: string): Promise<void> {
    const embeds: EmbedBuilder[] = [];
    // TODO: Refactor this command's usage as it's not very intuitive.
    if (!display || display === 'téléchargements') {
      const { lastPrerelease, lastStableRelease } = this.container.client.cache.github;

      // Check if a prerelease is greater than the last stable release.
      const isPrereleaseImportant = lastPrerelease
        ? semver.gt(
            semver.coerce(lastPrerelease.tag_name) ?? '',
            semver.coerce(lastStableRelease?.tag_name) ?? '',
          )
        : true;

      const baseMessage = isPrereleaseImportant
        ? config.messages.embed.versionsWithPrerelease
        : config.messages.embed.versionsWithoutPrerelease;
      const downloadDescription = pupa(baseMessage, {
        latest: lastPrerelease,
        latestStable: lastStableRelease,
      });

      embeds.push(
        new EmbedBuilder()
          .setColor(colors.default)
          .setTitle(config.messages.embed.downloadTitle)
          .setTimestamp()
          .setDescription(downloadDescription)
          .setFooter({ text: config.messages.embed.footer }),
      );
    }

    if (!display || display === 'liens utiles') {
      embeds.push(
        new EmbedBuilder()
          .setColor(colors.default)
          .setTitle(config.messages.embed.informationsTitle)
          .setTimestamp()
          .setDescription(config.messages.embed.information)
          .setFooter({ text: config.messages.embed.footer }),
      );
    }

    await interaction.reply({ embeds });
  }
}
