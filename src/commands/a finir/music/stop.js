import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { RichEmbed } from 'discord.js';

class Stop extends Command {
	
	name = 'Arrêter la musique';
	shortDescription = config.messages.commands.stop.shortDesc;
	longDescription = config.messages.commands.stop.longDesc;
	usage = `${config.bot.prefix}stop`;
	examples = ['stop'];
	regex = /stop/gimu;

	execute = async (message, args) => {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`);

		embed.setTitle("Arrêter la musique");
		if (message.guild.voiceConnection) {
			if (message.guild.voiceConnection.dispatcher) {
				message.guild.voiceConnection.dispatcher.end();
				embed.setDescription("Arrêt total de la musique");
			} else {
				embed.setDescription("Je ne joue aucune musique actuellement !");
			}
		} else {
			embed.setDescription("Je ne suis pas dans un canal vocal !");
		}
		message.channel.send(embed);
	}
}

export default Stop;
