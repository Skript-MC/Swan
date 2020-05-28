import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { SkripttoolsAddons } from '../../main';
import { uncapitalize, jkDistance, convertFileSize, selectorMessage } from '../../utils';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class AddonInfo extends Command {
  constructor() {
    super('Addon Info');
    this.aliases = ['addoninfo', 'addon_info', 'addon-info'];
    this.usage = 'addon-info <addon>';
    this.examples = ['addon-info skquery-lime', 'addoninfo mirror'];
  }

  async execute(client, message, args) {
    if (args.length === 0) {
      message.channel.sendError(this.config.invalidCmd, message.member);
    } else {
      const msg = await message.channel.send(this.config.searching);
      const addons = await SkripttoolsAddons;

      const myAddon = args.join(' ');

      let matchingAddons = addons.filter(elt => elt.plugin.toUpperCase().includes(myAddon.toUpperCase()));

      // Limite à 10 élements. + simple à gérer pour le moment, on pourra voir + tard si on peut faire sans.
      matchingAddons = matchingAddons.slice(0, 10);

      await msg.delete();
      if (matchingAddons.length === 0) {
        // Si l'addon est inconnu
        const matches = [];
        for (const elt of addons.map(addon => addon.plugin)) {
          if (jkDistance(args.join(''), elt) >= this.config.similarity) matches.push(elt);
        }

        if (matches.length === 0) {
          message.channel.sendError(this.config.addonDoesntExist.replace('%s', `${myAddon}`), message.member);
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
              return this.sendDetails(client.config, message, addons.filter(elt => elt.plugin === matches[index])[0]);
            });
        }
      } else if (matchingAddons.length === 1) {
        this.sendDetails(client.config, message, matchingAddons[0]);
      } else {
        selectorMessage(
          client,
          matchingAddons,
          myAddon,
          message,
          this.config,
          addon => addon.plugin,
          this.sendDetails,
        );
      }
    }
  }

  async sendDetails(config, message, addon, thisConfig = this.config) {
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor(`Informations sur ${addon.plugin}`, 'attachment://logo.png')
      .setTimestamp()
      .setDescription(addon.description || 'Aucune description disponible.')
      .setFooter(`Exécuté par ${message.author.username} | Données fournies par https://skripttools.net`);

    if (addon.unmaintained) embed.addField(thisConfig.embed.unmaintained, thisConfig.embed.unmaintained_desc, true);
    if (addon.author) embed.addField(thisConfig.embed.author, addon.author, true);
    if (addon.version) embed.addField(thisConfig.embed.version, addon.version, true);
    if (addon.download) embed.addField(thisConfig.embed.download, `[Téléchargez ici](${addon.download}) (${convertFileSize(addon.bytes)})`, true);
    if (addon.sourcecode) embed.addField(thisConfig.embed.sourcecode, `[Voir ici](${addon.sourcecode})`, true);
    if (addon.depend && addon.depend.depend) embed.addField(thisConfig.embed.depend, addon.depend.depend.join(', '), true);
    if (addon.depend && addon.depend.softdepend) embed.addField(thisConfig.embed.softdepend, addon.depend.softdepend.join(', '), true);

    message.channel.send(embed);
  }
}

export default AddonInfo;
