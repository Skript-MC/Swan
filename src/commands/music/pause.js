import Command from '../../components/Command';
import config from "../../../config/config.json";
import { RichEmbed } from 'discord.js';

class Pause extends Command {
	constructor () {
		super('pause')
		this.usage = `${config.bot.prefix}pause`;
		this.examples = ['pause'];
		this.regex = /pause/gimu;
	}
	async execute(message, args) {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`);

		embed.setTitle("pause");
		if (args.length > 0 && (args[0].toLowerCase() === "status" || args[0].toLowerCase() === "s"))
			embed.setDescription(`Statut : ${message.guild.voiceConnection.dispatcher.paused ? "En pause" : "En train de jouer"}`);
		else {
			try {
				if (message.guild.voiceConnection.dispatcher.paused) {
					embed.setDescription("On reprend la musique !");
					message.guild.voiceConnection.dispatcher.resume();
				} else {
					embed.setDescription("Mise en pause !");
					message.guild.voiceConnection.dispatcher.pause();
				}
			} catch (err) {
				if (err.message == "Cannot read property 'dispatcher' of null") {
					embed.setDescription("Je ne suis pas dans un canal vocal !");
				} else if (err.message == "Cannot read property 'paused' of undefined") {
					embed.setDescription("Je ne joue aucune musique actuellement !");
				}
			}
		}
		message.channel.send(embed);
	}
}

export default Pause;
