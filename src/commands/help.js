import Discord from 'discord.js';
import Config from '../../config/config.json';

export default {

	regex: '(help|aide)',

	execute: async message => {
		const embed = new Discord.RichEmbed()
			.setAuthor("Skript-mc > Aide", "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setDescription("Liste des commandes disponibles.")
			.setColor(Config.bot.embed)
			.setThumbnail("https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setFooter("Executé par " + message.author.username);

		return message.channel.send(embed);
	}

};
