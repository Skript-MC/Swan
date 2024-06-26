import { ApplyOptions } from '@sapphire/decorators';
import { EmbedLimits } from '@sapphire/discord-utilities';
import type { ChatInputCommand } from '@sapphire/framework';
import axios from 'axios';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import { addonInfo as config } from '#config/commands/info';
import * as messages from '#config/messages';
import { apis, colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';
import type { SkriptToolsAddonResponse } from '#types/index';
import { convertFileSize, searchClosestAddon, trimText } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class AddonInfoCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'addon',
      description: 'Addon dont vous souhaitez avoir des informations',
      required: true,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('addon', true));
  }

  public override async autocompleteRun(interaction: SwanCommand.AutocompleteInteraction): Promise<void> {
    const addonNames = Object.keys(this.container.client.cache.skriptToolsAddons);
    const search = searchClosestAddon(addonNames, interaction.options.getString('addon', true));
    await interaction.respond(
      search.slice(0, 20).map((entry) => ({
        name: entry.matchedName,
        value: entry.baseName,
      })),
    );
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, addon: string): Promise<void> {
    const addonVersions = this.container.client.cache.skriptToolsAddons[addon];
    if (!addonVersions || addonVersions.length === 0) {
      await interaction.reply({
        content: pupa(config.messages.unknownAddon, {
          addon: trimText(addon, 100),
        }),
        allowedMentions: {
          parse: [],
        },
      });
      return;
    }

    const addonVersion = addonVersions.at(-1);
    if (!addonVersion) {
      await interaction.reply(messages.global.oops);
      return;
    }

    await this._sendDetail(interaction, addonVersion);
  }

  private async _sendDetail(interaction: SwanCommand.ChatInputInteraction, addonFile: string): Promise<void> {
    const addon: SkriptToolsAddonResponse = await axios(`${apis.addons}/${addonFile}`)
      .then((res) => res?.data?.data)
      .catch((err: Error) => {
        this.container.logger.error(err.message);
      });

    if (!addon) {
      await interaction.reply(messages.global.oops);
      return;
    }

    const embedMessages = config.messages.embed;

    const embed = new EmbedBuilder()
      .setColor(colors.default)
      .setAuthor({ name: pupa(embedMessages.title, { addon }) })
      .setTimestamp()
      .setDescription(trimText(addon.description || embedMessages.noDescription, EmbedLimits.MaximumDescriptionLength))
      .setFooter({ text: embedMessages.footer });

    if (addon.unmaintained)
      embed.addFields({
        name: embedMessages.unmaintained,
        value: embedMessages.unmaintainedDescription,
        inline: true,
      });
    if (addon.author)
      embed.addFields({
        name: embedMessages.author,
        value: addon.author.join(', '),
        inline: true,
      });
    if (addon.version)
      embed.addFields({
        name: embedMessages.version,
        value: addon.version,
        inline: true,
      });
    if (addon.download) {
      const content = pupa(embedMessages.downloadDescription, {
        addon,
        size: convertFileSize(Number.parseInt(addon.bytes, 10)),
      });
      embed.addFields({
        name: embedMessages.download,
        value: content,
        inline: true,
      });
    }
    if (addon.sourcecode) {
      embed.addFields({
        name: embedMessages.sourcecode,
        value: pupa(embedMessages.sourcecodeDescription, { addon }),
        inline: true,
      });
    }
    if (addon.depend?.depend && addon.depend.depend.length > 0)
      embed.addFields({
        name: embedMessages.depend,
        value: addon.depend.depend.join(', '),
        inline: true,
      });
    if (addon.depend?.softdepend && addon.depend.softdepend.length > 0)
      embed.addFields({
        name: embedMessages.softdepend,
        value: addon.depend.softdepend.join(', '),
        inline: true,
      });

    await interaction.reply({ embeds: [embed] });
  }
}
