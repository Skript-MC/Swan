import axios from 'axios';
import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { addonInfo as config } from '../../../config/commands/info';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Logger from '../../structures/Logger';
import { convertFileSize, jaroWinklerDistance } from '../../utils';

class AddonInfoCommand extends Command {
  constructor() {
    super('addonInfo', {
      aliases: config.settings.aliases,
      description: { ...config.description },
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

  async exec(message, args) {
    const { addon } = args;
    const matchingAddons = this.client.addonsVersions
      .filter(elt => jaroWinklerDistance(elt.split(' ').shift().toUpperCase(), addon) >= 0.7)
      .map(elt => ({ file: elt, name: elt.split(' ').shift() }))
      .slice(0, 10);

    const isExactMatch = match => addon.toLowerCase() === match.name.toLowerCase();
    if (matchingAddons.length === 0) {
      message.util.send(config.messages.unknownAddon.replace('{ADDON}', addon));
    } else if (matchingAddons.length === 1) {
      this.sendDetail(message, matchingAddons[0].file);
    } else if (matchingAddons.some(isExactMatch)) {
      this.sendDetail(message, matchingAddons.find(isExactMatch).file);
    } else {
      const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
      let content = config.messages.searchResults.replace('{AMOUNT}', matchingAddons.length).replace('{QUERY}', addon);

      for (const [i, match] of matchingAddons.entries())
        content += `\n${reactionsNumbers[i]} ${match.name}`;

      if (matchingAddons.length - 10 > 0)
        content += config.messages.more.replace('{AMOUNT}', matchingAddons.length - 10);
      const selectorMessage = await message.util.send(content);

      const collector = selectorMessage
        .createReactionCollector((reaction, user) => !user.bot
          && user.id === message.author.id
          && reactionsNumbers.includes(reaction.emoji.name))
        .once('collect', (reaction) => {
          selectorMessage.reactions.removeAll();
          this.sendDetail(message, matchingAddons[reactionsNumbers.indexOf(reaction.emoji.name)].file);
          collector.stop();
        });

      for (const [i] of matchingAddons.entries()) {
        if (collector.ended)
          break;
        // eslint-disable-next-line no-await-in-loop
        await selectorMessage.react(reactionsNumbers[i]);
      }
    }
  }

  async sendDetail(message, addonFile) {
    const addon = await axios(settings.apis.addons + addonFile)
      .then(res => res?.data?.data)
      .catch(err => Logger.error(err.message));
    if (!addon)
      return message.util.send(messages.global.oops);

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
      const content = config.messages.embed.downloadDescription.replace('{LINK}', addon.download).replace('{SIZE}', convertFileSize(addon.bytes));
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
