import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import config from "../../../config/config.json";
import { discordInfo } from "../../components/messages";
import axios from "axios";

class SkriptInfo extends Command {
	constructor() {
		super('skriptinfo')
		this.usage = `${config.bot.prefix}skript-info`;
		this.examples = ['skriptInfo'];
		this.regex = /s(?:k|c)(?:ript?)?-?infos?/gimu;
	}
	async execute(message, args) {
		const data = await axios(config.miscellaneous.api_skript, { method: 'GET' })
			.then(async response => {
				if (response.status !== 200) {
					error(`[HTTP request failed] Error : ${response.status}`);
					return discordError(`Une erreur est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status}`, message)
				}
				return response.data;
			}).catch(err => console.error(err));

		const latest = data.data[data.data.length - 1].replace(/\s/gimu, '+');

		axios(`${config.miscellaneous.api_skript}${latest}`, { method: 'GET' })
			.then(async response => {
				if (response.status !== 200) {
					error(`[HTTP request failed] Error : ${response.status}`);
					return discordError(`Une erreur est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status}`, message)
				}
				this.sendDetails(message, response.data);
			}).catch(err => console.error(err));
	}
	async sendDetails(message, data) {
		let size = -1;
		if (data.data.bytes) size = data.data.bytes / 1000000;
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Informations sur Skript`, config.bot.avatar)
			.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`)
			.setTimestamp();

		if (data.data.author)
			embed.addField(this.config.embed.author, data.data.author, true);
		if (data.data.download)
			embed.addField(this.config.embed.download, `[Téléchargez ici](${data.data.download}) ${size.toFixed(2)} Mo`, true);
		if (data.data.source)
			embed.addField(this.config.embed.sourcecode, `[Voir ici](${data.data.source})`, true);
		if (data.data.version)
			embed.addField(this.config.embed.version, `${data.data.version} (1.9 - 1.13)`, true);
		message.channel.send(embed);
		discordInfo(this.config.embed.verInfo_desc, message);
	}
	
};

export default SkriptInfo;
