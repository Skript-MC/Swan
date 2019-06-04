import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { RichEmbed } from 'discord.js';

class Quit extends Command {
	
	name = 'Quitter le canal';
	shortDescription = config.messages.commands.quit.shortDesc;
	longDescription = config.messages.commands.quit.longDesc;
	usage = `${config.bot.prefix}quit`;
	examples = ['quit'];
	regex = /quit/gimu;

	execute = async (message, args) => {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`);

		embed.setTitle("Quitter le canal");
		if (!message.guild.voiceConnection)
			embed.setDescription("Je ne suis pas dans un canal vocal !")
		if (!embed.description) {
			embed.setDescription(`J'ai quitté le canal **${message.guild.voiceConnection.channel.name}** !`);
			message.guild.voiceConnection.disconnect();
		}
		message.channel.send(embed);
	}
}

export default Quit;
