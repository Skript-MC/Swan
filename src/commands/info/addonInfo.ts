import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import type { Message, MessageReaction, User } from 'discord.js';
import jaroWinklerDistance from 'jaro-winkler';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { MatchingAddon, SkriptToolsAddonResponse, SwanCommandOptions } from '@/app/types';
import { AddonInfoCommandArguments } from '@/app/types/CommandArguments';
import { convertFileSize, noop, trimText } from '@/app/utils';
import { addonInfo as config } from '@/conf/commands/info';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class AddonInfoCommand extends SwanCommand {
  @Arguments({
    name: 'addon',
    type: 'string',
    match: 'rest',
    required: true,
    message: messages.prompt.addon,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: AddonInfoCommandArguments): Promise<void> {
    // Get all matching addons, by looking if the similarity between the query and the addon is >= 70%.
    // We keep only the first 10 matching addons.
    const matchingAddons: MatchingAddon[] = this.container.client.cache.addonsVersions
      .filter(elt => jaroWinklerDistance(elt.split(' ').shift()!, args.addon, { caseSensitive: false }) >= 0.7)
      .map(elt => ({ file: elt, name: elt.split(' ').shift()! }))
      .slice(0, 10);

    // If we found no match.
    if (matchingAddons.length === 0) {
      await message.channel.send(pupa(config.messages.unknownAddon, args));
      return;
    }
    // If we found one match, show it directly.
    if (matchingAddons.length === 1) {
      await this._sendDetail(message, matchingAddons[0].file);
      return;
    }

    // If we found multiple matches, present them nicely and ask the user which to choose.
    const possibleMatch = matchingAddons.find(match => args.addon.toLowerCase() === match.name.toLowerCase());
    if (possibleMatch) {
      await this._sendDetail(message, possibleMatch.file);
      return;
    }

    let content = pupa(config.messages.searchResults, { matchingAddons, addon: args.addon });

    for (const [i, match] of matchingAddons.entries())
      content += `\n${settings.miscellaneous.reactionNumbers[i]} ${match.name}`;

    if (matchingAddons.length - 10 > 0)
      content += pupa(config.messages.more, { amount: matchingAddons.length - 10 });

    const selectorMessage = await message.channel.send(content);

    const collector = selectorMessage
      .createReactionCollector({
        filter: (reaction: MessageReaction, user: User) => !user.bot
          && user.id === message.author.id
          && settings.miscellaneous.reactionNumbers.includes(reaction.emoji.name),
      }).once('collect', async (reaction) => {
        await selectorMessage.delete();
        const index = settings.miscellaneous.reactionNumbers.indexOf(reaction.emoji.name);
        await this._sendDetail(message, matchingAddons[index].file);
        collector.stop();
      });

    for (const [i] of matchingAddons.entries()) {
      if (collector.ended)
        break;
      await selectorMessage.react(settings.miscellaneous.reactionNumbers[i]).catch(noop);
    }
  }

  private async _sendDetail(message: Message, addonFile: string): Promise<void> {
    const addon: SkriptToolsAddonResponse = await axios(settings.apis.addons + addonFile)
      .then(res => res?.data?.data)
      .catch((err: Error) => { this.container.logger.error(err.message); });

    if (!addon) {
      await message.channel.send(messages.global.oops);
      return;
    }

    const embedMessages = config.messages.embed;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(pupa(embedMessages.title, { addon }))
      .setTimestamp()
      .setDescription(trimText(addon.description || embedMessages.noDescription, 2000))
      .setFooter(pupa(embedMessages.footer, { member: message.member }));

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

    await message.channel.send({ embeds: [embed] });
  }
}
