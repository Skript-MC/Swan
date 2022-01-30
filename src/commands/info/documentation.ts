import { EmbedLimits } from '@sapphire/discord-utilities';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import Turndown from 'turndown';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SkriptMcDocumentationSyntaxAndAddon } from '@/app/types';
import { searchClosestArticle, stripTags, trimText } from '@/app/utils';
import { documentation as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

const turndownService = new Turndown();

@ApplySwanOptions(config)
export default class DocumentationCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'article',
      description: 'Article de la documentation que vous souhaitez envoyer',
      required: true,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('article'));
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const search = searchClosestArticle(this.container.client.cache.skriptMcSyntaxes, interaction.options.getString('article'));
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
    interaction: CommandInteraction,
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
    interaction: CommandInteraction,
    article: SkriptMcDocumentationSyntaxAndAddon,
  ): Promise<void> {
    const embedMessages = config.messages.embed;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setTitle(stripTags(pupa(embedMessages.title, { article })))
      .setURL(article.documentationUrl)
      .setTimestamp()
      .setDescription(
        trimText(
          turndownService.turndown(
            pupa(embedMessages.description, {
              article: {
                ...article,
                content: article.content || embedMessages.noDescription,
              },
            }),
          ), EmbedLimits.MaximumDescriptionLength / 2,
        ),
      )
      .setFooter({ text: pupa(embedMessages.footer, { member: interaction.member }) });

    if (article.deprecation) {
      embed.addField(
        embedMessages.deprecated,
        article.deprecationLink ? embedMessages.depreactionReplacement : embedMessages.noReplacement,
      );
    }

    const dependency = article.addon.dependency ? ` (requiert ${article.addon.dependency})` : '';
    const addon = `[${article.addon.name}](${article.addon.documentationUrl})${dependency}`;

    embed.addField(embedMessages.version, article.version, true);
    embed.addField(embedMessages.addon, addon, true);
    embed.addField(embedMessages.pattern, pupa(embedMessages.patternContent, { pattern: stripTags(article.pattern) }));
    embed.addField(embedMessages.example, pupa(embedMessages.exampleContent, { example: stripTags(article.example) }));

    await interaction.reply({ embeds: [embed] });
  }
}
