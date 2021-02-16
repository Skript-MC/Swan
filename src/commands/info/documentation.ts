import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import he from 'he';
import jaroWinklerDistance from 'jaro-winkler';
import pupa from 'pupa';
import type{ DocumentationCommandArguments } from '@/app/types/CommandArguments';
import type { GuildMessage, SkriptMcDocumentationSyntaxResponse } from '@/app/types/index';
import { noop, trimText } from '@/app/utils';
import { documentation as config } from '@/conf/commands/info';
import settings from '@/conf/settings';


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
    // Get all the matching syntaxes thanks to this very accurate and complex algorithm:
    // - Discard if the category asked doesn't match (90%) the category of the syntax;
    // - Discard if the addon asked isn't the same as the addon of the syntax;
    // - Select if the query matches (70%) the name of the syntax;
    // - Or select if the query matches (70%) the description of the syntax;
    // - Or select if the query is included in the name of the syntax;
    // We then only take the first 10 results.
    const matchingSyntaxes: SkriptMcDocumentationSyntaxResponse[] = this.client.cache.skriptMcSyntaxes
      .filter((elt) => {
        if (args.category && jaroWinklerDistance(elt.category, args.category, { caseSensitive: false }) < 0.9)
          return false;
        if (args.addon && elt.addon.name.toLowerCase() !== args.addon.toLowerCase())
          return false;
        return jaroWinklerDistance(elt.name, args.query, { caseSensitive: false }) >= 0.7
          || jaroWinklerDistance(elt.content, args.query, { caseSensitive: false }) >= 0.7
          || elt.name.toLowerCase().includes(args.query.toLowerCase());
      })
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
      .createReactionCollector((reaction, user) => !user.bot
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

  private async _sendDetail(message: GuildMessage, syntax: SkriptMcDocumentationSyntaxResponse): Promise<void> {
    const embedMessages = config.messages.embed;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setTitle(he.decode(pupa(embedMessages.title, { syntax })))
      .setURL(syntax.documentationUrl)
      .setTimestamp()
      .setDescription(
        trimText(
          he.decode(
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

    if (syntax.deprecation)
      embed.addField(embedMessages.deprecated, syntax.deprecationLink ? embedMessages.depreactionReplacement : '');

    const dependency = syntax.addon.dependency ? ` (requiert ${syntax.addon.dependency})` : '';
    const addon = `[${syntax.addon.name}](${syntax.addon.documentationUrl})` + dependency;

    embed.addField(embedMessages.version, syntax.version, true);
    embed.addField(embedMessages.addon, addon, true);
    embed.addField(embedMessages.pattern, pupa(embedMessages.patternContent, { pattern: he.decode(syntax.pattern) }));
    embed.addField(embedMessages.example, pupa(embedMessages.exampleContent, { example: he.decode(syntax.example) }));

    await message.channel.send(embed);
  }
}

export default DocumentationCommand;
