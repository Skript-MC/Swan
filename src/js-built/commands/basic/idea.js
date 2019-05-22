import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import config from "../../../../config/config.json";

class Idea extends Command {
	
	name = 'Idée';
	shortDescription = config.messages.commands.idea.shortDesc;
	longDescription = config.messages.commands.idea.longDesc;
	usage = `${config.bot.prefix}code <code skript>`;
	examples = ['.code broadcast "Bienvenue"'];
	regex = /id(?:ée|ea)(?:-?skript)?/gmui;

	execute = async (message, args) => {
		// const chan = message.guild.channels.get(config.miscellaneous.ideaChannelId);
		const chan = message.guild.channels.get('577167794203000873');
		chan.fetchMessages()
			.then(messages => {
				const msgs = messages.array();
				const msg = msgs[Math.floor(Math.random() * msgs.length)];
				const embed = new RichEmbed()
					.setColor(config.bot.color)
					.setAuthor("Idée", "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
					.setDescription(`Idée de ${msg.author} :\n${msg.content}`);
				message.channel.send(embed);
			});
	};
}
	
export default Idea;
