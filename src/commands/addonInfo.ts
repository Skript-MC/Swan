import Discord, { Message } from "discord.js";
import https from "https";
import config from "../../config/config.json";
import Command from "../components/Command";
import { error, discordError } from "../components/Messages";

const conf: any = config.messages.commands.addonInfo;

/*
 * Variables :
 * currentData : Objet contenant tous les addons, chaque addons contenant 1 tableau
 * Object.keys(data.data) : Tableau contenant tous les addons (avec case)
 * addons : Tableau contenant tous les addons (sans case)
 * myAddon : String avec le nom de l'addon recherché (avec case)
 * versions : Liste de toutes les versions de l'addon recherché
 */

async function sendEmbed(message: Message, data: any) {
	let size: number, unit: string;
	if (data.data.bytes) {
		size = data.data.bytes / 1000000;
		unit = "Mo";
		if (size < 1) {
			size *= 1000;
			unit = "Ko";
		}
	}
	const embed: Discord.RichEmbed = new Discord.RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur ${data.data.plugin}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
		.setDescription(data.data.description || "Aucune description disponible.");
	if (data.data.unmaintained)
		embed.addField(conf.embed.unmaintained, conf.embed.unmaintained_desc, true);
	if (data.data.author)
		embed.addField(conf.embed.author, data.data.author, true);
	if (data.data.version)
		embed.addField(conf.embed.version, data.data.version, true);
	if (data.data.download)
		embed.addField(conf.embed.download, `[Téléchargez ici](${data.data.download}) ${size.toFixed(2)} ${unit}`, true);
	if (data.data.sourcecode)
		embed.addField(conf.embed.sourcecode, `[Voir ici](${data.data.sourcecode})`, true);
	if (data.data.depend && data.data.depend.depend)
		embed.addField(conf.embed.depend, data.data.depend.depend, true);
	if (data.data.depend && data.data.depend.softdepend)
		embed.addField(conf.embed.softdepend, data.data.depend.softdepend, true);
	embed.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`);

	message.channel.send(embed);
}

class AddonInfo extends Command {

	name: string = "Addon";
	description: string = conf.description;
	examples: string[] = ["addon-info", "addonsinfos"];
	regex: RegExp = /a(?:dd?ons?)?-?infos?/gimu;

	execute = async (message: Message, args: string[]): Promise<void> => {
		if (args.length < 1) {
			discordError(conf.invalidCmd, message);
		} else {
			const addons: Array<any> = [];
			const myAddon: string = args[0];

			let json = "";

			https.get(config.miscellaneous.api_addons, resp => {
				resp.on("data", chunk => (json += chunk));
				resp.on("end", () => {
					let data = JSON.parse(json);

					let versions: string;
					for (let addon of Object.keys(data.data)) {
						addons.push(addon.toLowerCase());
					}

					if (addons.includes(myAddon.toLowerCase())) {
						for (let addon of Object.keys(data.data)) {
							if (addon.toLowerCase() === myAddon.toLowerCase()) {
								versions = data.data[addon];
							}
						}
						let latest = versions[versions.length - 1];
						latest = latest.replace(" ", "+");

						https.get(`${config.miscellaneous.api_addons}${latest}`, resp2 => {
							json = "";
							resp2.on("data", chunk => (json += chunk));
							resp2.on("end", () => {
								let data = JSON.parse(json);
								sendEmbed(message, data);
							});
						}).on("error", err => error(`${err}`));
					} else {
						const msg: string = conf.addonDoesntExist;
						discordError(msg.replace("%s", `${args[0]}`), message);
					}
				});
			}).on("error", err => error(`${err}`));
		}
	};
}

export default AddonInfo;
