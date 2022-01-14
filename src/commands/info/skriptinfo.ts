import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import semver from 'semver';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { skriptInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';
import ApplySwanOptions from '@/app/decorators/swanOptions';

@ApplySwanOptions(config)
export default class SkriptInfoCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
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
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('catégorie'));
  }

  private async _exec(interaction: CommandInteraction, display: string): Promise<void> {
    const embeds: MessageEmbed[] = [];
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
        new MessageEmbed()
          .setColor(settings.colors.default)
          .setTitle(config.messages.embed.downloadTitle)
          .setTimestamp()
          .setDescription(downloadDescription)
          .setFooter({ text: pupa(config.messages.embed.footer, { member: interaction.member }) }),
      );
    }

    if (!display || display === 'liens utiles') {
      embeds.push(
        new MessageEmbed()
          .setColor(settings.colors.default)
          .setTitle(config.messages.embed.informationsTitle)
          .setTimestamp()
          .setDescription(config.messages.embed.information)
          .setFooter({ text: pupa(config.messages.embed.footer, { member: interaction.member }) }),
      );
    }

    await interaction.reply({ embeds });
  }
}
