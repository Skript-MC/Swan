import { MessageEmbed } from 'discord.js';
import Command from '../../helpers/Command';
import { discordError } from '../../helpers/messages';
import { SkripttoolsAddons, config } from '../../main';
import { uncapitalize, jkDistance } from '../../utils';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class AddonInfo extends Command {
  constructor() {
    super('Addon Info');
    this.aliases = ['addoninfo', 'addon_info', 'addon-info'];
    this.usage = 'addon-info <addon>';
    this.examples = ['addon-info skquery-lime', 'addoninfo mirror'];
  }

  async execute(message, args) {
    if (args.length === 0) {
      message.channel.send(discordError(this.config.invalidCmd, message));
    } else {
      let msg = await message.channel.send(this.config.searching);
      const addons = await SkripttoolsAddons;

      const myAddon = args.join(' ');

      let matchingAddons = addons.filter(elt => elt.plugin.toUpperCase().includes(myAddon.toUpperCase()));
      const results = matchingAddons.length;

      // Limite à 10 élements. + simple à gérer pour le moment, on pourra voir + tard si on peut faire sans.
      matchingAddons = matchingAddons.slice(0, 10);

      if (matchingAddons.length === 0) {
        await msg.delete();

        // Si l'addon est inconnu
        const matches = [];
        for (const elt of addons.map(addon => addon.plugin)) {
          if (jkDistance(args.join(''), elt) >= this.config.similarity) matches.push(elt);
        }

        if (matches.length === 0) {
          message.channel.send(discordError(this.config.addonDoesntExist.replace('%s', `${myAddon}`), message));
        } else {
          const addonsList = matches.map(elt => uncapitalize(elt.replace(/ /g, ''))).join('`, `.addoninfo ');
          const suggestion = await message.channel.send(this.config.cmdSuggestion.replace('%c', args.join('')).replace('%m', addonsList));

          if (matches.length === 1) suggestion.react('✅');
          else for (let i = 0; i < reactionsNumbers.length && i < matches.length; i++) await suggestion.react(reactionsNumbers[i]);

          const collector = suggestion
            .createReactionCollector((reaction, user) => !user.bot
                && user.id === message.author.id
                && (reaction.emoji.name === '✅' || reactionsNumbers.includes(reaction.emoji.name)))
            .once('collect', (reaction) => {
              collector.stop();
              suggestion.delete();
              const index = reaction.emoji.name === '✅' ? 0 : reactionsNumbers.indexOf(reaction.emoji.name);
              return this.sendDetails(message, addons.filter(elt => elt.plugin === matches[index])[0]);
            });
        }
      } else if (matchingAddons.length === 1) {
        msg.delete();
        this.sendDetails(message, matchingAddons[0]);
      } else {
        await msg.edit(this.config.searchResults.replace('%r', results).replace('%s', myAddon));
        for (let i = 0; i < matchingAddons.length; i++) {
          msg = await msg.edit(`${msg.content}\n${reactionsNumbers[i]} ${matchingAddons[i].plugin}`);
          await msg.react(reactionsNumbers[i]);
        }
        await msg.react('❌');
        if (results - 10 > 0) msg = await msg.edit(`${msg.content}\n...et ${results - 10} de plus...`);

        const collectorNumbers = msg
          .createReactionCollector((reaction, user) => !user.bot
            && user.id === message.author.id
            && reactionsNumbers.includes(reaction.emoji.name))
          .once('collect', (reaction) => {
            msg.delete();
            this.sendDetails(message, matchingAddons[reactionsNumbers.indexOf(reaction.emoji.name)]);
            collectorNumbers.stop();
          });
        const collectorStop = msg
          .createReactionCollector((reaction, user) => !user.bot
            && user.id === message.author.id
            && reaction.emoji.name === '❌')
          .once('collect', () => {
            message.delete();
            msg.delete();
            collectorNumbers.stop();
            collectorStop.stop();
          });
      }
    }
  }

  async sendDetails(message, addon) {
    let size;
    let unit;
    if (addon.bytes) {
      size = addon.bytes / 1000000;
      unit = 'Mo';
      if (size < 1) {
        size *= 1000;
        unit = 'Ko';
      }
    }
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor(`Informations sur ${addon.plugin}`, 'attachment://logo.png')
      .setTimestamp()
      .setDescription(addon.description || 'Aucune description disponible.')
      .setFooter(`Exécuté par ${message.author.username} | Données fournies par https://skripttools.net`);

    if (addon.unmaintained) embed.addField(this.config.embed.unmaintained, this.config.embed.unmaintained_desc, true);
    if (addon.author) embed.addField(this.config.embed.author, addon.author, true);
    if (addon.version) embed.addField(this.config.embed.version, addon.version, true);
    if (addon.download) embed.addField(this.config.embed.download, `[Téléchargez ici](${addon.download}) ${size.toFixed(2)} ${unit}`, true);
    if (addon.sourcecode) embed.addField(this.config.embed.sourcecode, `[Voir ici](${addon.sourcecode})`, true);
    if (addon.depend && addon.depend.depend) embed.addField(this.config.embed.depend, addon.depend.depend.join(', '), true);
    if (addon.depend && addon.depend.softdepend) embed.addField(this.config.embed.softdepend, addon.depend.softdepend.join(', '), true);

    message.channel.send(embed);
  }
}

export default AddonInfo;
