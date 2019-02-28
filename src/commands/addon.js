import Discord from "discord.js";
import axios from "axios";

export default {

	regex: 'add?dons?',

	execute: async message => {
		if (!args || args.length == 0) {
			addonspage(1, message);
		} else {
			addonname(message, args[0]);
		}
	}
}

function addonname(message, name) {
	axios.get('https://api.skripttools.net/v4/addons', {
		responseType: 'json'
	}).then(async response => {
		if (response.status === 200) {
			size = Object.keys(response.data.data).length;
			embed = new Discord.RichEmbed()
				.setAuthor("Addon", "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
				.setTitle(name)
				.setDescription("Addons correspondant à \"" + name + "\"")
				.setColor(config["bot"]["embeds_couleur"])
				.setThumbnail("https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
				.setFooter("Executé par " + message.author.username);
			x = 0;
			for (namedata in response.data.data) {
				version = response.data.data[namedata][response.data.data[namedata].length - 1];				
				if (namedata.toLowerCase().includes(name.toLowerCase()) && x < 16) {
					dl = version.replace(" ","+");
					embed.addField(namedata,"[" + version.replace(".jar", "") + "](https://skripttools.net/dl/" + dl + ")");
				}
			}
			return message.channel.send(embed);			
		}
	})
};
