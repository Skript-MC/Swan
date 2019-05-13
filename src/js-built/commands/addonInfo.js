import { RichEmbed } from "discord.js";
import config from "../../../config/config.json";
import Command from "../components/Command";
import { discordError } from "../components/Messages";
import { SkripttoolsSyntaxes } from '../main';

const conf = config.messages.commands.addonInfo;
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

/*
 * Variables :
 * currentData : Objet contenant tous les addons, chaque addons contenant 1 tableau
 * Object.keys(data.data) : Tableau contenant tous les addons (avec case)
 * addons : Tableau contenant tous les addons (sans case)
 * myAddon : String avec le nom de l'addon recherché (avec case)
 * versions : Liste de toutes les versions de l'addon recherché
 */

async function sendEmbed(message, addon) {
	let size, unit;
	if (addon.data.bytes) {
		size = addon.data.bytes / 1000000;
		unit = "Mo";
		if (size < 1) {
			size *= 1000;
			unit = "Ko";
		}
	}
	const embed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur ${addon.data.plugin}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
		.setDescription(addon.data.description || "Aucune description disponible.");
	if (addon.data.unmaintained)
		embed.addField(conf.embed.unmaintained, conf.embed.unmaintained_desc, true);
	if (addon.data.author)
		embed.addField(conf.embed.author, addon.data.author, true);
	if (addon.data.version)
		embed.addField(conf.embed.version, addon.data.version, true);
	if (addon.data.download)
		embed.addField(conf.embed.download, `[Téléchargez ici](${addon.data.download}) ${size.toFixed(2)} ${unit}`, true);
	if (addon.data.sourcecode)
		embed.addField(conf.embed.sourcecode, `[Voir ici](${addon.data.sourcecode})`, true);
	if (addon.data.depend && addon.data.depend.depend)
		embed.addField(conf.embed.depend, addon.data.depend.depend, true);
	if (addon.data.depend && addon.data.depend.softdepend)
		embed.addField(conf.embed.softdepend, addon.data.depend.softdepend, true);
	embed.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`);

	message.channel.send(embed);
}

class AddonInfo extends Command {

	name = 'Addon';
	shortDescription = conf.shortDesc;
	longDescription = conf.longDesc;
	usage = `${config.bot.prefix}addon-info `;
	examples = ['addon-info skquery-lime', 'addonsinfos -list'];
	channels = ['*'];
	regex = /a(?:dd?ons?)?-?infos?/gimu;

	execute = async (message, args) => {
		if (args.length < 1) {
			discordError(conf.invalidCmd, message);
		} else {
			let msg = await message.channel.send("Je vais chercher ça...");
			const addons = await SkripttoolsSyntaxes;

			let myAddon = args.join(' ');

			if (myAddon === '-list')
				return message.channel.send(conf.list.replace('%s', addons.join(', ')))

			let matchingAddons = addons.filter(elt => elt.data.plugin.toUpperCase().includes(myAddon.toUpperCase()));
			const results = matchingAddons.length
			
			// On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
			matchingAddons = matchingAddons.slice(0, 10)
			
			if (matchingAddons.length === 0) {
				await msg.delete();
				return discordError(conf.addonDoesntExist.replace("%s", `${myAddon}`), message);
			} else if (matchingAddons.length === 1) {
				msg.delete();
				return sendEmbed(message, matchingAddons[0]);
			} else {
				await msg.edit(`${results} élements trouvés pour la recherche \`${myAddon}\`. Quel addon vous interesse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
				for (let i = 0; i < matchingAddons.length; i++) {
					msg = await msg.edit(`${msg.content}\n${reactionsNumbers[i]} ${matchingAddons[i].data.plugin}`);
					await msg.react(reactionsNumbers[i]);
				}
				await msg.react('❌');
				if (results - 10 > 0)
					msg = await msg.edit(`${msg.content}\n...et ${results - 10} de plus...`)
				
					const collectorNumbers = msg
					.createReactionCollector((reaction, user) => !user.bot && user.id === message.author.id && reactionsNumbers.includes(reaction.emoji.name))
					.once('collect', reaction => {
						msg.delete();
						sendEmbed(message, matchingAddons[reactionsNumbers.indexOf(reaction.emoji.name)]);
						collectorNumbers.stop();
					})
				const collectorStop = msg
					.createReactionCollector((reaction, user) => !user.bot && user.id === message.author.id && reaction.emoji.name === '❌')
					.once('collect', () => {
						message.delete();
						msg.delete();
						collectorNumbers.stop();
						collectorStop.stop();
					});
			}
		}
	};
}

export default AddonInfo;
