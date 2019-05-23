import Command from '../../components/Command';
import { functions } from '../../musicCore.js';
import config from "../../../../config/config.json";
import { RichEmbed } from 'discord.js';
const { PlayMusicLink, musicSearch } = functions;


class Play extends Command {
	
	name = 'Jouer une musique';
	shortDescription = config.messages.commands.play.shortDesc;
	longDescription = config.messages.commands.play.longDesc;
	usage = `${config.bot.prefix}play`;
	examples = ['play'];
	regex = /play/gimu;

	execute = async (message, args) => {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`);

		if (args[0]) {
			let music, msg;
			if (new RegExp(/^(?:https?:\/\/)?(?:www\.)?youtube.com\/watch\?v=[a-zA-Z0-9-_]{11}$/gimu).test(args[0])) {
				music = ["nop", args[0]];
				msg = message;
			} else {
				const request = message.content.substring(6);
				embed.setTitle("Chercher une musique");
				embed.setDescription("Recherche en cours...");

				msg = await message.channel.send(embed);
				music = await musicSearch(request, 1);

				if (!music[1][1]) {
					embed.setTitle("Erreur");
					embed.setDescription("Aucun résultat trouvé pour cette recherche Youtube !");
					msg.edit(embed);
					return;
				}
				music[1][2] = `http://youtube.com/watch?v=${music[1][2]}`;
			}
			const music2 = new PlayMusicLink(msg, message.author, music[1]);
			if (msg === message) await music2.init();

			if (args[0] == "directplay") music2.checkDependencies(true, true);
			else music2.checkDependencies(true);

		} else {
			embed.setTitle("Erreur");
			embed.setDescription("Tu dois mettre un argument (lien ou nom de musique etc) !");
			message.channel.send(embed);
		}
	}
}

export default Play;
