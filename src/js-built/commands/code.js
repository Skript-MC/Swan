import { RichEmbed } from "discord.js";
import Command from '../components/Command';
import { discordError } from '../components/Messages';
import config from "../../../config/config.json";

class Code extends Command {
	
	name = 'Code';
	shortDescription = config.messages.commands.code.shortDesc;
	longDescription = config.messages.commands.code.longDesc;
	usage = `${config.bot.prefix}code <code skript>`;
	examples = ['.code broadcast "Bienvenue"'];
	regex = /code/gmui;
	channels = ['215217809687445504', '483673337223184394', '396976352487669762', '483673411394994177']; //ids des salons d'aides, les ids sont dans l'ordre des salons

	execute = async (message, args) => {
		if (args.length === 0){
			discordError("Commande incorrecte. Veuillez ajouter un code.", message);
		} else {
			const embed = new RichEmbed()
				.setColor(config.bot.color)
				.setAuthor(`Code de ${message.author.username}`)
				.setDescription(`\`\`\`${args.join(" ")}\`\`\``)
				.setFooter(`Commande executée par ${message.author.username}`);
			message.channel.send(embed);
		}
	}
}
	
export default Code;
