import Command from '../../components/Command';
import config from "../../../config/config.json";
import { RichEmbed } from 'discord.js';

class Quit extends Command {
	constructor () {
		super('quit')
		this.usage = `${config.bot.prefix}quit`;
		this.examples = ['quit'];
		this.regex = /quit/gimu;
	}
	async exemple(message, args) {
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
