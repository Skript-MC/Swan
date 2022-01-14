import { EmbedLimits } from '@sapphire/discord-utilities';
import { ChatInputCommand } from '@sapphire/framework';
import axios from 'axios';
import { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction, MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SkriptToolsAddonResponse } from '@/app/types';
import { convertFileSize, searchClosestAddon, trimText } from '@/app/utils';
import { addonInfo as config } from '@/conf/commands/info';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

@ApplySwanOptions(config)
export default class AddonInfoCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'addon',
      description: 'Addon dont vous souhaitez avoir des informations',
      required: true,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('addon'));
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const search = searchClosestAddon(this.container.client.cache.addonsVersions, interaction.options.getString('addon'));
    await interaction.respond(
      search
        .slice(0, 20)
        .map(entry => ({
          name: entry.matchedName,
          value: entry.baseName,
        })),
    );
  }

  private async _exec(interaction: CommandInteraction, addon: string): Promise<void> {
    const matchingAddon = this.container.client.cache.addonsVersions.find(elt => elt === addon);
    if (!matchingAddon) {
      await interaction.reply(pupa(config.messages.unknownAddon, { addon }));
      return;
    }

    await this._sendDetail(interaction, matchingAddon);
  }

  private async _sendDetail(interaction: CommandInteraction, addonFile: string): Promise<void> {
    const addon: SkriptToolsAddonResponse = await axios(settings.apis.addons + addonFile)
      .then(res => res?.data?.data)
      .catch((err: Error) => { this.container.logger.error(err.message); });

    if (!addon) {
      await interaction.reply(messages.global.oops);
      return;
    }

    const embedMessages = config.messages.embed;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({ name: pupa(embedMessages.title, { addon }) })
      .setTimestamp()
      .setDescription(trimText(addon.description || embedMessages.noDescription, EmbedLimits.MaximumDescriptionLength))
      .setFooter({ text: pupa(embedMessages.footer, { member: interaction.member }) });

    if (addon.unmaintained)
      embed.addField(embedMessages.unmaintained, embedMessages.unmaintainedDescription, true);
    if (addon.author)
      embed.addField(embedMessages.author, addon.author.join(', '), true);
    if (addon.version)
      embed.addField(embedMessages.version, addon.version, true);
    if (addon.download) {
      const content = pupa(embedMessages.downloadDescription, {
        addon,
        size: convertFileSize(Number.parseInt(addon.bytes, 10)),
      });
      embed.addField(embedMessages.download, content, true);
    }
    if (addon.sourcecode)
      embed.addField(embedMessages.sourcecode, pupa(embedMessages.sourcecodeDescription, { addon }), true);
    if (addon.depend?.depend)
      embed.addField(embedMessages.depend, addon.depend.depend.join(', '), true);
    if (addon.depend?.softdepend)
      embed.addField(embedMessages.softdepend, addon.depend.softdepend.join(', '), true);

    await interaction.reply({ embeds: [embed] });
  }
}
