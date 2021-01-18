import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import he from 'he';
import jaroWinklerDistance from 'jaro-winkler';
import pupa from 'pupa';
import { documentation as config } from '../../../config/commands/info';
import settings from '../../../config/settings';
import type{ DocumentationCommandArguments } from '../../types/CommandArguments';
import type { GuildMessage, SkriptMcDocumentationSyntaxResponse } from '../../types/index';


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
    const matchingSyntaxes: SkriptMcDocumentationSyntaxResponse[] = this.client.skriptMcSyntaxes
      .filter((elt) => {
        if (args.category && jaroWinklerDistance(elt.category.toLowerCase(), args.category.toUpperCase()) < 0.9)
          return false;
        if (args.addon && elt.addon.name.toLowerCase() !== args.addon.toLowerCase())
          return false;
        return jaroWinklerDistance(elt.name, args.query) >= 0.7
          || jaroWinklerDistance(elt.content, args.query) >= 0.7
          || elt.name.toLowerCase().includes(args.query.toLowerCase());
      })
      .slice(0, 10);

    if (matchingSyntaxes.length === 0) {
      await message.util.send(
        pupa(config.messages.unknownSyntax, {
          query: `${args.query}${args.addon ? ` pour l'addon "${args.addon}"` : ''}${args.category ? ` dans la catégorie "${args.category}"` : ''}`,
        }),
      );
      return;
    }
    if (matchingSyntaxes.length === 1) {
      await this._sendDetail(message, matchingSyntaxes[0]);
      return;
    }

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

    const selectorMessage = await message.util.send(content);

    const collector = selectorMessage
      .createReactionCollector((reaction, user) => !user.bot
        && user.id === message.author.id
        && settings.miscellaneous.reactionNumbers.includes(reaction.emoji.name))
      .once('collect', async (reaction) => {
        await selectorMessage.reactions.removeAll();
        const index = settings.miscellaneous.reactionNumbers.indexOf(reaction.emoji.name);
        await this._sendDetail(message, matchingSyntaxes[index]);
        collector.stop();
      });

    for (const [i] of matchingSyntaxes.entries()) {
      if (collector.ended)
        break;
      await selectorMessage.react(settings.miscellaneous.reactionNumbers[i]);
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
        he.decode(
          pupa(embedMessages.description, {
            syntax: {
              ...syntax,
              content: syntax.content || embedMessages.noDescription,
            },
          }),
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

    await message.util.send(embed);
  }
}

export default DocumentationCommand;
