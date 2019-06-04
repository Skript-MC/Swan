import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { variables } from '../../musicCore.js';
import { RichEmbed } from 'discord.js';
const { serverQueues } = variables;

class Queue extends Command {
	
	name = 'Queue';
	shortDescription = config.messages.commands.queue.shortDesc;
	longDescription = config.messages.commands.queue.longDesc;
	usage = `${config.bot.prefix}queue`;
	examples = ['queue'];
	regex = /queue/gimu;

	execute = async (message, args) => {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`);

		embed.setTitle("Queue actuelle");
		if (serverQueues[message.guild.id].queue[0]) {
			embed.addField("Musique suivante :", serverQueues[message.guild.id].getNextName());
			for (let i = 1; i < serverQueues[message.guild.id].queue.length; i++) {
				embed.addField(`Musique en position ${i + 1} :`, serverQueues[message.guild.id].queue[i][0]);
			}
		} else {
			embed.setDescription("Aucune queue actuellement !");
		}
		message.channel.send(embed);
	}
	
}

export default Queue;
