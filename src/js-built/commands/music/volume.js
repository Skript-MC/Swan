import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { RichEmbed } from 'discord.js';

class Volume extends Command {

	name = 'Volume';
	shortDescription = config.messages.commands.volume.shortDesc;
	longDescription = config.messages.commands.volume.longDesc;
	usage = `${config.bot.prefix}volume [volume%]`;
	examples = ['volume', 'volume 50%'];
	regex = /volume/gimu;

	execute = async (message, args) => {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`)
			.setTitle("Volume de la Musique");

		if (!message.guild.voiceConnection) {
			embed.setDescription("Je ne suis pas dans un canal vocal !");
		} else if (!message.guild.voiceConnection.dispatcher) {
			embed.setDescription("Je ne joue aucune musique actuellement !");
		} else {
			if (args[0]) {
				if (args[0].slice(-1) == "%") {
					let percent = args[0].substring(0, (args[0].length - 1));
					if (vol => 0.5 && vol <= 500) {
						let vol = message.guild.voiceConnection.dispatcher.volume / 100 * percent;
						if (vol * 17.5 >= 0.001 && vol * 17.5 <= 10) {
							embed.setDescription("Volume mis à " + args[0] + " du volume actuel !");
							vol = Math.ceil(vol * 17.5 * 100) / 100 / 17.5;

							message.guild.voiceConnection.dispatcher.setVolume(vol);
						} else {
							embed.setDescription("Ce pourcentage donnerait un volume inédéquat ( trop fort/faible ) !");
						}
					} else {
						embed.setDescription("Merci de mettre un pourcentage valide !");
					}
				} else {
					if (args[0] > 0.001 && args[0] <= 10) {
						embed.setDescription("Volume mis à " + args[0] + " !");
						args[0] = Math.ceil(args[0] * 100) / 100;
						message.guild.voiceConnection.dispatcher.setVolume(args[0] / 17.5);
					} else {
						embed.setDescription("Veuillez entrer un nombre entre 1 et 10 !");
					}
				}
			} else {
				embed.setDescription("Volume actuel : " + message.guild.voiceConnection.dispatcher.volume * 17.5);
			}
		}
		message.channel.send(embed);
	}
}

export default Volume;
