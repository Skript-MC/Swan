import axios from 'axios';
import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';
import pupa from 'pupa';
import { addonInfo as config } from '../../../config/commands/info';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Logger from '../../structures/Logger';
import type { AddonResponse, GuildMessage, MatchingAddon } from '../../types';
import type { AddonInfoCommandArguments } from '../../types/CommandArguments';
import { convertFileSize, jaroWinklerDistance } from '../../utils';

class AddonInfoCommand extends Command {
  constructor() {
    super('addonInfo', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'addon',
        type: 'string',
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, { addon }: AddonInfoCommandArguments): Promise<void> {
    const matchingAddons: MatchingAddon[] = this.client.addonsVersions
      .filter(elt => jaroWinklerDistance(elt.split(' ').shift().toUpperCase(), addon) >= 0.7)
      .map(elt => ({ file: elt, name: elt.split(' ').shift() }))
      .slice(0, 10);

    const isExactMatch = (match: MatchingAddon): boolean => addon.toLowerCase() === match.name.toLowerCase();

    if (matchingAddons.length === 0) {
      await message.util.send(pupa(config.messages.unknownAddon, { addon }));
      return;
    }
    if (matchingAddons.length === 1) {
      await this._sendDetail(message, matchingAddons[0].file);
      return;
    }
    if (matchingAddons.some(isExactMatch)) {
      await this._sendDetail(message, matchingAddons.find(isExactMatch).file);
      return;
    }

    const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
    let content = pupa(config.messages.searchResults, { matchingAddons, addon });

    for (const [i, match] of matchingAddons.entries())
      content += `\n${reactionsNumbers[i]} ${match.name}`;

    if (matchingAddons.length - 10 > 0)
      content += pupa(config.messages.more, { amount: matchingAddons.length - 10 });

    const selectorMessage = await message.util.send(content);

    const collector = selectorMessage
      .createReactionCollector((reaction, user) => !user.bot
        && user.id === message.author.id
        && reactionsNumbers.includes(reaction.emoji.name))
      .once('collect', async (reaction) => {
        await selectorMessage.reactions.removeAll();
        await this._sendDetail(message, matchingAddons[reactionsNumbers.indexOf(reaction.emoji.name)].file);
        collector.stop();
      });

    for (const [i] of matchingAddons.entries()) {
      if (collector.ended)
        break;
      await selectorMessage.react(reactionsNumbers[i]);
    }
  }

  private async _sendDetail(message: Message, addonFile: string): Promise<void> {
    const addon: AddonResponse = await axios(settings.apis.addons + addonFile)
      .then(res => res?.data?.data)
      .catch((err) => { Logger.error(err.message); });

    if (!addon) {
      await message.util.send(messages.global.oops);
      return;
    }

    const embedMessages = config.messages.embed;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(pupa(embedMessages.title, { addon }))
      .setTimestamp()
      .setDescription(addon.description || embedMessages.noDescription)
      .setFooter(pupa(embedMessages.footer, { member: message.member }));

    if (addon.unmaintained)
      embed.addField(embedMessages.unmaintained, embedMessages.unmaintainedDescription, true);
    if (addon.author)
      embed.addField(embedMessages.author, addon.author, true);
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

    await message.util.send(embed);
  }
}

export default AddonInfoCommand;
