import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { RichEmbed } from 'discord.js';

class Join extends Command {
	
	name = 'Rejoindre le canal';
	shortDescription = config.messages.commands.join.shortDesc;
	longDescription = config.messages.commands.join.longDesc;
	usage = `${config.bot.prefix}join`;
	examples = ['join'];
	regex = /join/gimu;

	execute = async (message, args) => {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`);

		embed.setTitle("join");
		if (message.guild.voiceConnection && message.guild.voiceConnection.channel.id == message.member.voiceChannel.id)
			embed.setDescription("Je suis déja dans ce canal vocal !");
		if (!embed.description) {
			message.member.voiceChannel.join();
			embed.setDescription(`J'arrive dans **${message.member.voiceChannel.name}** !`);
		}
		message.channel.send(embed);
	}
}

export default Join;
