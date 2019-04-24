import Discord, { Message, RichEmbed } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import https from "https";

const conf: any = config.messages.commands.skriptInfo;

async function sendEmbed(message: Message, data: any) {
	let size: number, unit: string;
	if (data.data.bytes) size = data.data.bytes / 1000000;
	const embed: RichEmbed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur Skript`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
	if (data.data.author)
		embed.addField(conf.embed.author, data.data.author, true);
	if (data.data.download)
		embed.addField(conf.embed.download, `[Téléchargez ici](${data.data.download}) ${size.toFixed(2)} Mo`, true);
	if (data.data.source)
		embed.addField(conf.embed.sourcecode, `[Voir ici](${data.data.source})`, true);
	if (data.data.version)
		embed.addField(conf.embed.version, `${data.data.version} (1.9 - 1.13)`, true);
	embed.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`);
	const embed2: RichEmbed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(conf.embed.verInfo, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
		.setDescription(conf.embed.verInfo_desc)
		.setFooter(`Executé par ${message.author.username}`);

	message.channel.send(embed);
	message.channel.send(embed2);
}

class SkriptInfo extends Command {

	name: string = 'Skript';
	description: string = config.messages.commands.addonInfo.description;
	examples: string[] = ['skriptInfo'];
	regex: RegExp = /s(?:k|c)(?:ript?)?-?infos?/gimu;

	execute = async (message: Message, args: string[]): Promise<void> => {
		https.get(config.miscellaneous.api_skript, resp => {
			let json = "";
			resp.on("data", chunk => (json += chunk));
			resp.on("end", () => {
				let data = JSON.parse(json);
				let latest = data.data[data.data.length - 1];

				https.get(`${config.miscellaneous.api_skript}${latest}`, resp => {
					json = "";
					resp.on("data", chunk => (json += chunk));
					resp.on("end", () => {
						data = JSON.parse(json);
						sendEmbed(message, data)
					});
				});

			});
		});
	}
};

export default SkriptInfo;
