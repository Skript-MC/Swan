import axios from 'axios';
import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';
import { addonInfo as config } from '../../../config/commands/info';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Logger from '../../structures/Logger';
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

  public async exec(message: Message, { addon }: AddonInfoCommandArguments): Promise<void> {
    interface MatchingAddon {
      file: string;
      name: string;
    }

    const matchingAddons: MatchingAddon[] = this.client.addonsVersions
      .filter(elt => jaroWinklerDistance(elt.split(' ').shift().toUpperCase(), addon) >= 0.7)
      .map(elt => ({ file: elt, name: elt.split(' ').shift() }))
      .slice(0, 10);

    const isExactMatch = (match: MatchingAddon): boolean => addon.toLowerCase() === match.name.toLowerCase();

    if (matchingAddons.length === 0) {
      await message.util.send(config.messages.unknownAddon.replace('{ADDON}', addon));
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
    let content = config.messages.searchResults
      .replace('{AMOUNT}', matchingAddons.length.toString())
      .replace('{QUERY}', addon);

    for (const [i, match] of matchingAddons.entries())
      content += `\n${reactionsNumbers[i]} ${match.name}`;

    if (matchingAddons.length - 10 > 0)
      content += config.messages.more.replace('{AMOUNT}', (matchingAddons.length - 10).toString());

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
    interface AddonResponse {
      author: string[];
      plugin: string;
      version: string;
      description?: string;
      unmaintained: boolean;
      bytes: string;
      download: string;
      sourcecode?: string;
      depend?: {
        depend?: string[];
        softdepend?: string[];
        loadbefore?: string[];
      };
    }

    const addon: AddonResponse | null = await axios(settings.apis.addons + addonFile)
      .then(res => res?.data?.data)
      .catch((err) => { Logger.error(err.message); }) || null;

    if (!addon) {
      await message.util.send(messages.global.oops);
      return;
    }

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(config.messages.embed.title.replace('{NAME}', addon.plugin))
      .setTimestamp()
      .setDescription(addon.description || config.messages.embed.noDescription)
      .setFooter(config.messages.embed.footer.replace('{MEMBER}', message.member.displayName));

    if (addon.unmaintained)
      embed.addField(config.messages.embed.unmaintained, config.messages.embed.unmaintainedDescription, true);
    if (addon.author)
      embed.addField(config.messages.embed.author, addon.author, true);
    if (addon.version)
      embed.addField(config.messages.embed.version, addon.version, true);
    if (addon.download) {
      const content = config.messages.embed.downloadDescription
        .replace('{LINK}', addon.download)
        .replace('{SIZE}', convertFileSize(Number.parseInt(addon.bytes, 10)));
      embed.addField(config.messages.embed.download, content, true);
    }
    if (addon.sourcecode)
      embed.addField(config.messages.embed.sourcecode, config.messages.embed.sourcecodeDescription.replace('{LINK}', addon.sourcecode), true);
    if (addon.depend?.depend)
      embed.addField(config.messages.embed.depend, addon.depend.depend.join(', '), true);
    if (addon.depend?.softdepend)
      embed.addField(config.messages.embed.softdepend, addon.depend.softdepend.join(', '), true);

    await message.util.send(embed);
  }
}

export default AddonInfoCommand;
