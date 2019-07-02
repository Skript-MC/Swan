/* eslint-disable curly */
import { RichEmbed } from 'discord.js';
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { SkripttoolsAddons, config } from '../../main';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

/*
 * Variables :
 * currentData : Objet contenant tous les addons, chaque addons contenant 1 tableau
 * Object.keys(data.data) : Tableau contenant tous les addons (avec case)
 * addons : Tableau contenant tous les addons (sans case)
 * myAddon : String avec le nom de l'addon recherché (avec case)
 * versions : Liste de toutes les versions de l'addon recherché
 */

class AddonInfo extends Command {
  constructor() {
    super('addonInfo');
    this.usage = `${config.bot.prefix}addon-info <addon>`;
    this.examples.push('addon-info skquery-lime', 'addonsinfos -list', 'addoninfo mirror');
    this.regex = /a(?:dd?ons?)?-?infos?/gimu;
  }

  async execute(message, args) {
    if (args.length < 1) {
      discordError(this.config.invalidCmd, message);
    } else {
      let msg = await message.channel.send('Je vais chercher ça...');
      const addons = await SkripttoolsAddons;

      const myAddon = args.join(' ');

      if (myAddon.toLowerCase() === '-list') {
        return message.channel.send(this.config.list.replace('%s', addons.join(', ')));
      }

      let matchingAddons = addons.filter(elt => elt.plugin.toUpperCase().includes(myAddon.toUpperCase()));
      const results = matchingAddons.length;

      // Limite à 10 élements. + simple à gérer pour le moment, on pourra voir + tard si on peut faire sans.
      matchingAddons = matchingAddons.slice(0, 10);

      if (matchingAddons.length === 0) {
        await msg.delete();
        return discordError(this.config.addonDoesntExist.replace('%s', `${myAddon}`), message);
      } else if (matchingAddons.length === 1) {
        msg.delete();
        return this.sendDetails(message, matchingAddons[0]);
      } else {
        await msg.edit(`${results} élements trouvés pour la recherche \`${myAddon}\`. Quel addon vous interesse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
        for (let i = 0; i < matchingAddons.length; i++) {
          msg = await msg.edit(`${msg.content}\n${reactionsNumbers[i]} ${matchingAddons[i].plugin}`);
          await msg.react(reactionsNumbers[i]);
        }
        await msg.react('❌');
        if (results - 10 > 0) {
          msg = await msg.edit(`${msg.content}\n...et ${results - 10} de plus...`);
        }

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
    const embed = new RichEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Informations sur ${addon.plugin}`, config.bot.avatar)
      .setTimestamp()
      .setDescription(addon.description || 'Aucune description disponible.')
      .setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`);

    if (addon.unmaintained)
      embed.addField(this.config.embed.unmaintained, this.config.embed.unmaintained_desc, true);
    if (addon.author)
      embed.addField(this.config.embed.author, addon.author, true);
    if (addon.version)
      embed.addField(this.config.embed.version, addon.version, true);
    if (addon.download)
      embed.addField(this.config.embed.download, `[Téléchargez ici](${addon.download}) ${size.toFixed(2)} ${unit}`, true);
    if (addon.sourcecode)
      embed.addField(this.config.embed.sourcecode, `[Voir ici](${addon.sourcecode})`, true);
    if (addon.depend && addon.depend.depend)
      embed.addField(this.config.embed.depend, addon.depend.depend, true);
    if (addon.depend && addon.depend.softdepend)
      embed.addField(this.config.embed.softdepend, addon.depend.softdepend, true);

    message.channel.send(embed);
  }
}

export default AddonInfo;
