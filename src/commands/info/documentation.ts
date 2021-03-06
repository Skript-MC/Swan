import { Command } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import jaroWinklerDistance from 'jaro-winkler';
import pupa from 'pupa';
import Turndown from 'turndown';
import type { GuildMessage, SkriptMcDocumentationSyntaxAndAddon } from '@/app/types';
import type { DocumentationCommandArguments } from '@/app/types/CommandArguments';
import { noop, stripTags, trimText } from '@/app/utils';
import { documentation as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

const turndownService = new Turndown();

class DocumentationCommand extends Command {
  constructor() {
    super('documentation', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'query',
        type: 'string',
        match: 'rest',
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      }, {
        id: 'addon',
        match: 'option',
        flag: ['--addon=', '-a='],
      }, {
        id: 'category',
        match: 'option',
        flag: ['--category=', '--categorie=', '--catégorie=', '--cat=', '-c=', '--type=', '-t='],
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: DocumentationCommandArguments): Promise<void> {
    // Get all the matching syntaxes thanks to this very accurate and complex algorithm.
    // Each syntax is given a score between 0 and 1 symbolising the similarity with the user's query:
    // - 1 if the query matches the syntax's ID
    // - 0 if the query does not match the syntax's category
    // - 0 if the query does not match the syntax's addon
    // - 4 properties are tested: englishName, frenchName, name and content
    //   The similarity of each is calculated in this order, and if this similarity exceeds 0.7,
    //   then the syntax similarity score is defined.
    // The list of syntaxes is sorted by their similarity score and we then only take the first 10 results.
    // If a syntax has a similarity higher than 0.9, then we deduce that it is the best and most accurate syntax,
    // so we send it directly. Otherwise, we propose to the user to choose which syntax he wants to display in the
    // order of similarity. This algorithm is subject to change depending on its production effectiveness.

    const similarity: Array<[article: SkriptMcDocumentationSyntaxAndAddon, similarity: number]> = [];
    this.client.cache.skriptMcSyntaxes
      .forEach((article) => {
        if (args.query === article.id.toString())
          return similarity.push([article, 1]);
        if (args.category && jaroWinklerDistance(article.category, args.category, { caseSensitive: false }) < 0.9)
          return similarity.push([article, 0]);
        if (args.addon && article.addon.name.toLowerCase() !== args.addon.toLowerCase())
          return similarity.push([article, 0]);
        for (const property of [article.englishName, article.frenchName, article.name, article.content]) {
          if (property) {
            const distance = jaroWinklerDistance(property, args.query, { caseSensitive: false });
            if (distance >= 0.7)
              return similarity.push([article, distance]);
          }
        }
        return similarity.push([article, 0]);
      });

    // Sorting in descending order.
    similarity.sort((a, b) => b[1] - a[1]);

    // Checking the existence of an accurate syntax.
    const bestMatch = similarity.filter(elt => elt[1] > 0.9);
    if (bestMatch.length === 1) {
      await this._sendDetail(message, bestMatch[0][0]);
      return;
    }

    // Formatting the data to return an array containing only 10 results.
    const matchingSyntaxes = similarity
      .filter(elt => elt[1] > 0.5)
      .map(elt => elt[0])
      .slice(0, 10);

    // If we found no match.
    if (matchingSyntaxes.length === 0) {
      await message.channel.send(
        pupa(config.messages.unknownSyntax, {
          query: `${args.query}${args.addon ? ` pour l'addon "${args.addon}"` : ''}${args.category ? ` dans la catégorie "${args.category}"` : ''}`,
        }),
      );
      return;
    }
    // If we found one match, show it directly.
    if (matchingSyntaxes.length === 1) {
      await this._sendDetail(message, matchingSyntaxes[0]);
      return;
    }

    // If we found multiple matches, present them nicely and ask the user which to choose.
    const possibleMatch = matchingSyntaxes.find(match => args.query.toLowerCase() === match.name.toLowerCase());
    if (possibleMatch) {
      await this._sendDetail(message, possibleMatch);
      return;
    }

    let content = pupa(config.messages.searchResults, { matchingSyntaxes, syntax: args.query });

    for (const [i, match] of matchingSyntaxes.entries())
      content += `\n${settings.miscellaneous.reactionNumbers[i]} ${match.name}`;

    if (matchingSyntaxes.length - 10 > 0)
      content += pupa(config.messages.more, { amount: matchingSyntaxes.length - 10 });

    const selectorMessage = await message.channel.send(content);

    const collector = selectorMessage
      .createReactionCollector((reaction: MessageReaction, user: User) => !user.bot
        && user.id === message.author.id
        && settings.miscellaneous.reactionNumbers.includes(reaction.emoji.name))
      .once('collect', async (reaction) => {
        await selectorMessage.delete();
        const index = settings.miscellaneous.reactionNumbers.indexOf(reaction.emoji.name);
        await this._sendDetail(message, matchingSyntaxes[index]);
        collector.stop();
      });

    for (const [i] of matchingSyntaxes.entries()) {
      if (collector.ended)
        break;
      await selectorMessage.react(settings.miscellaneous.reactionNumbers[i]).catch(noop);
    }
  }

  private async _sendDetail(message: GuildMessage, syntax: SkriptMcDocumentationSyntaxAndAddon): Promise<void> {
    const embedMessages = config.messages.embed;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setTitle(stripTags(pupa(embedMessages.title, { syntax })))
      .setURL(syntax.documentationUrl)
      .setTimestamp()
      .setDescription(
        trimText(
          turndownService.turndown(
            pupa(embedMessages.description, {
              syntax: {
                ...syntax,
                content: syntax.content || embedMessages.noDescription,
              },
            }),
          ), 2000,
        ),
      )
      .setFooter(pupa(embedMessages.footer, { member: message.member }));

    if (syntax.deprecation) {
      embed.addField(
        embedMessages.deprecated,
        syntax.deprecationLink ? embedMessages.depreactionReplacement : embedMessages.noReplacement,
      );
    }

    const dependency = syntax.addon.dependency ? ` (requiert ${syntax.addon.dependency})` : '';
    const addon = `[${syntax.addon.name}](${syntax.addon.documentationUrl})` + dependency;

    embed.addField(embedMessages.version, syntax.version, true);
    embed.addField(embedMessages.addon, addon, true);
    embed.addField(embedMessages.pattern, pupa(embedMessages.patternContent, { pattern: stripTags(syntax.pattern) }));
    embed.addField(embedMessages.example, pupa(embedMessages.exampleContent, { example: stripTags(syntax.example) }));

    await message.channel.send(embed);
  }
}

export default DocumentationCommand;
