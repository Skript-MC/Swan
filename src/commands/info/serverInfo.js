import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import { error, discordError } from '../../components/Messages';
import config from "../../../../config/config.json";
import fetch from 'node-fetch';

const conf = config.messages.commands.serverInfo;

function sendEmbed(message, msg, data, ip) {
	const embed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur ${ip}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
		.setFooter(`Executé par ${message.author.username} | Données fournies par https://api.mcsrvstat.us/`);
	if (data.online != undefined)
		embed.addField(conf.embed.status, (data.online ? "En ligne" : "Hors ligne"), true);
	if (data.ip)
		embed.addField(conf.embed.ip, `\`${data.ip}${data.port ? `:${data.port}` : ""}\``, true);
	if (data.players)
		embed.addField(conf.embed.players, `${data.players.online}/${data.players.max}`, true);
	if (data.version)
		embed.addField(conf.embed.version, data.version, true);
	if (data.hostname)
		embed.addField(conf.embed.hostname, data.hostname, true);
	if (data.software)
		embed.addField(conf.embed.software, data.software, true);
	if (data.plugins)
		embed.addField(conf.embed.plugins, data.plugin.raw.length, true);
	if (data.mods)
		embed.addField(conf.embed.mods, data.mods.raw.length, true);

	msg.edit(embed);
}

class ServerInfo extends Command {

	name = 'Serveur Info';
	shortDescription = conf.shortDesc;
	longDescription = conf.longDesc;
	usage = `${config.bot.prefix}serveur-info <IP>`;
	examples = ['serv-info hypixel.net'];
	regex = /se?rv(?:eu?r)?-?info(?:rmation)?s?/gmui;

	execute = async (message, args) => {
		let msg = await message.channel.send("Je vais chercher ça...");
		const data = await fetch(`${config.miscellaneous.api_server}${args[0]}`, { method: 'GET' })
			.then(async response => {
				if (response.status !== 200) {
					error(`[HTTP request failed] Error : ${response.status}`);
					return discordError(`Une erreure est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status}`, message)
				}
				let resp = await response.json();

				return resp;
			}).catch(err => error(err));
		if (!data) return discordError("Aucun serveur ne correspond a votre reqûete !", message);
		return sendEmbed(message, msg, data, args[0]);
	}
};

export default ServerInfo;
