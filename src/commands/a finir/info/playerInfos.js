import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import { error, discordError } from '../../components/Messages';
import config from "../../../../config/config.json";
import { formatDate } from "../../utils";
import fetch from 'node-fetch';

const conf = config.messages.commands.playerInfos;
const errorMessage = "Une erreure est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : "
function httpError(response, message) {
	error(`[HTTP request failed] Error : ${response.status}`);
	discordError(`${errorMessage} ${response.status} ${response.status === 429 ? "Trop de requêtes ! Attendez un peu..." : ""}`, message)
}

function sendEmbed(message, data, img, uuid) {
	const embed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur l'UUID ${uuid}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
		.setFooter(`Executé par ${message.author.username} | Données fournies par https://api.mojang.com/`)
		.addField(conf.embed.pseudo, `\`${data[data.length - 1].name}\``, false);
	if (img) {
		embed.attachFile({ attachment: img, name: "image.png" })
			.setThumbnail("attachment://image.png");
	}

	let history = '';
	if (data.length === 1) {
		history = conf.noHistory;
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
	embed.addField(conf.embed.history, history, false);
	message.channel.send(embed);
}

class PlayerInfos extends Command {

	name = 'Information joueur';
	shortDescription = conf.shortDesc;
	longDescription = conf.longDesc;
	usage = `${config.bot.prefix}player-info <pseudo>`;
	examples = ['player-info noftaly'];
	regex = /(?:player|joueur)-?info(?:rmation)?s?/gmui;

	execute = async (message, args) => {
		let msg = await message.channel.send("Je vais chercher ça... (1/3)");

		// On récupère l'UUID du joueur a partir de son pseudo
		const data_uuidFromName = await fetch(`${config.miscellaneous.api_mojang_api}/profiles/minecraft`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(args)
		}).then(async response => {
			if (response.status !== 200) return httpError(response, message);
			return await response.json();
		}).catch(err => {
			error(err);
		});

		if (!data_uuidFromName) return discordError("Une erreure est survenue, désolé.", message);
		if (data_uuidFromName.length === 0) {
			msg.delete();
			return discordError(conf.pseudoNotFound, message);
		}
		
		// On extrait l'UUID de la réponse obtenue
		const uuid = data_uuidFromName[0].id;

		msg.edit("Je vais chercher ça... (2/3)");
		// On récupère l'historique des pseudos du joueur
		const data_nameHystory = await fetch(`${config.miscellaneous.api_mojang_api}/user/profiles/${uuid}/names`, {
			method: 'GET'
		}).then(async response => {
			if (response.status !== 200) return httpError(response, message);
			return await response.json();
		}).catch(err => {
			error(err);
		});

		if (!data_nameHystory) return discordError("Une erreure est survenue, désolé.", message);
		
		msg.edit("Je vais chercher ça... (3/3)");
		const headBuffer = await fetch(`http://cravatar.eu/helmavatar/${uuid}/128.png`, {
			method: 'GET'
		}).then(response => {
			if (response.status !== 200) return httpError(response, message);
			return response.buffer();
		}).catch(err => {
			error(err);
		});
		if (!headBuffer) return discordError("Une erreure est survenue, désolé.", message);
		msg.delete();
		sendEmbed(message, data_nameHystory, headBuffer, uuid);
	}
};

export default PlayerInfos;
