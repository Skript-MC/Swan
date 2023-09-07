import { ApplyOptions } from '@sapphire/decorators';
import { EmbedLimits } from '@sapphire/discord-utilities';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import Turndown from 'turndown';
import { documentation as config } from '#config/commands/info';
import { colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';
import type { SkriptMcDocumentationSyntaxAndAddon } from '#types/index';
import { searchClosestArticle, stripTags, trimText } from '#utils/index';

const turndownService = new Turndown();

@ApplyOptions<SwanCommand.Options>(config.settings)
export class DocumentationCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'article',
      description: 'Article de la documentation que vous souhaitez envoyer',
      required: true,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('article', true));
  }

  public override async autocompleteRun(interaction: SwanCommand.AutocompleteInteraction): Promise<void> {
    const search = searchClosestArticle(this.container.client.cache.skriptMcSyntaxes, interaction.options.getString('article', true));
    await interaction.respond(
      search
        .slice(0, 20)
        .map(entry => ({
          name: entry.matchedName,
          value: entry.baseName,
        })),
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    articleId: string,
  ): Promise<void> {
    const matchingArticle = this.container.client.cache.skriptMcSyntaxes.find(elt => elt.id.toString() === articleId);
    if (!matchingArticle) {
      await interaction.reply({
        content: pupa(config.messages.unknownSyntax, { articleId: trimText(articleId, 100) }),
        allowedMentions: {
          parse: [],
        },
      });
      return;
    }

    await this._sendDetail(interaction, matchingArticle);
  }

  private async _sendDetail(
    interaction: SwanCommand.ChatInputInteraction,
    article: SkriptMcDocumentationSyntaxAndAddon,
  ): Promise<void> {
    const embedMsgs = config.messages.embed;

    const embed = new EmbedBuilder()
      .setColor(colors.default)
      .setTitle(stripTags(pupa(embedMsgs.title, { article })))
      .setURL(article.documentationUrl)
      .setTimestamp()
      .setDescription(
        trimText(
          turndownService.turndown(
            pupa(embedMsgs.description, {
              article: {
                ...article,
                content: article.content || embedMsgs.noDescription,
              },
            }),
          ), EmbedLimits.MaximumDescriptionLength / 2,
        ),
      )
      .setFooter({ text: pupa(embedMsgs.footer, { member: interaction.member }) });

    if (article.deprecation) {
      embed.addFields({
        name: embedMsgs.deprecated,
        value: article.deprecationLink ? embedMsgs.depreactionReplacement : embedMsgs.noReplacement,
      });
    }

    const dependency = article.addon.dependency ? ` (requiert ${article.addon.dependency})` : '';
    const addon = `[${article.addon.name}](${article.addon.documentationUrl})${dependency}`;

    embed.addFields(
      { name: embedMsgs.version, value: article.version, inline: true },
      { name: embedMsgs.addon, value: addon, inline: true },
      { name: embedMsgs.pattern, value: pupa(embedMsgs.patternContent, { pattern: stripTags(article.pattern) }) },
      { name: embedMsgs.example, value: pupa(embedMsgs.exampleContent, { example: stripTags(article.example) }) },
    );

    await interaction.reply({ embeds: [embed] });
  }
}
