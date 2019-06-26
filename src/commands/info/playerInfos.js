import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import config from "../../../config/config.json";
import { formatDate } from "../../utils";
import fetch from 'node-fetch';

class PlayerInfos extends Command {
	constructor() {
		super('playerinfo')
		this.usage = `${config.bot.prefix}player-info <pseudo>`;
		this.examples = ['player-info noftaly'];
		this.regex = /(?:player|joueur)-?info(?:rmation)?s?/gmui;
	}

	async execute(message, args){
		let msg = await message.channel.send("Je vais chercher ça... (1/3)");

		const options = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(args)
		};
		// On récupère l'UUID du joueur a partir de son pseudo
		const data_uuidFromName = await fetch(`${config.miscellaneous.api_mojang_api}/profiles/minecraft`, options)
			.then(async response => {
				if (response.status !== 200) return httpError(response, message);
				return await response.json();
			}).catch(err => console.error(err));

		if (!data_uuidFromName) return discordError("Une erreure est survenue, désolé.", message);
		if (data_uuidFromName.length === 0) {
			msg.delete();
			return discordError(this.config.pseudoNotFound, message);
		}
		
		// On extrait l'UUID de la réponse obtenue
		const uuid = data_uuidFromName[0].id;

		msg.edit("Je vais chercher ça... (2/3)");
		// On récupère l'historique des pseudos du joueur
		const data_nameHystory = await fetch(`${config.miscellaneous.api_mojang_api}/user/profiles/${uuid}/names`, { method: 'GET' }
			).then(async response => {
				if (response.status !== 200) return httpError(response, message);
				return await response.json();
			}).catch(err => console.error(err));

		if (!data_nameHystory) return discordError("Une erreure est survenue, désolé.", message);
		
		msg.edit("Je vais chercher ça... (3/3)");
		const headBuffer = await fetch(`http://cravatar.eu/helmavatar/${uuid}/128.png`, { method: 'GET' }
			).then(response => {
				if (response.status !== 200) return httpError(response, message);
				return response.buffer();
			}).catch(err => console.error(err));

		if (!headBuffer) return discordError("Une erreure est survenue, désolé.", message);
		msg.delete();
		this.sendDetails(message, data_nameHystory, headBuffer, uuid);
	}

	httpError(response, message) {
		console.error(`[HTTP request failed] Error : ${response.status}`);
		discordError(`Une erreure est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status} ${response.status === 429 ? "Trop de requêtes ! Attendez un peu..." : ""}`, message)
	}
	
	sendDetails(message, data, img, uuid) {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Informations sur l'UUID ${uuid}`, config.bot.avatar)
			.setFooter(`Executé par ${message.author.username} | Données fournies par https://api.mojang.com/`)
			.setTimestamp()
			.addField(this.config.embed.pseudo, `\`${data[data.length - 1].name}\``, false);

		if (img) {
			embed.attachFile({ attachment: img, name: "image.png" })
				.setThumbnail("attachment://image.png");
		}
	
		let history = '';
		if (data.length === 1) {
			history = this.config.noHistory;
		} else {
			let i = 1;
			for (let pseudo of data) {
				history += `${i} - \`${pseudo.name}\``
				if (pseudo.changedToAt)
					history += `(changé ${formatDate(pseudo.changedToAt)})`;
	
				history += `\n`;
				i++;
			}
		}
		embed.addField(this.config.embed.history, history, false);
		message.channel.send(embed);
	}

};

export default PlayerInfos;
