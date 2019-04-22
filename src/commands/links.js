import Discord from 'discord.js';
import Config from '../../config/config.json';
import {
	commands
} from '../main.js';
import {
	cpus
} from 'os';

export default {

	title: "Liens importants",
	description: "Avoir plusieurs liens importants relatifs à Skript.",
	examples: ['lien', 'liens', 'links'],
	regex: /(?:link|lien)s?/gmui,
	permissions: [],

	execute: async (message, page) => {

		page = Number.isInteger(page) ? page : 0;
		const maxPage = 5;
		const reactionsNumb = ['🇽', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣'];
		const reactionsPage = ['⏮', '◀', '🇽', '▶', '⏭'];
		const embed = new Discord.RichEmbed()
			.setColor(Config.bot.embed)
			.setAuthor(`Liens utiles (${page + 1}/${maxPage + 1})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setDescription('‌‌ ') // Caractère invisible (‌‌ )
			.setFooter("Executé par " + message.author.username);

		switch (page) {
			case 1:
				embed.addField(":books: Doc Skript de SkriptMC : https://bit.ly/2KSZ6pN", "Documentation sur Skript, faite par la communauté de Skript-MC. Elle est en français et est en constante amélioration. Si vous avez une suggestion, ou si vous voyez une erreur, n'hésitez pas à nous en faire part !", true)
					.addField(":books: Doc Skript officielle : https://bit.ly/2VUGZ3W", "Documentation de Skript officielle. Elle est en anglais, mais est complête, et contient toutes les syntaxes utilisables dans la dernière version de Skript.", true)
				break;
			case 2:
				embed.addField(":books: Doc addons de SkriptMC : https://bit.ly/2viSqq8", "Documentation des addons, faite par la communauté de Skript-MC. Elle ne contient pas encore tous les addons, mais est en français et est complête.", true)
					.addField(":books: Doc des addons : https://bit.ly/2UTSlJ6", "Documentation officielle de tous les addons. Elle est en anglais, mais contient la quasi-totalité des addons disponibles.", true)
				break;
			case 3:
				embed.addField(":inbox_tray: Téléchargement de Skript : https://bit.ly/2TMxYNm", "Lien pour télécharger la dernière version de Skript officielle. La dernière version de Skript en date ne supporte que les dernières versions de Minecraft de la 1.9 à la 1.13 incluses. Cela veut dire que la 1.12.1 n'est pas supportée, mais la 1.12.2 l'est. ", true)
					.addField(":inbox_tray: Téléchargement des addons : https://bit.ly/2XvahGH", "Lien de téléchargement des dernières versions de tous les addons existant pour Skript.", true)
				break;
			case 4:
				embed.addField(":speech_left: Discord Skript-MC : https://bit.ly/2XvahGH", "Lien officiel de ce discord.", true)
					.addField(":speech_left: Discord Skript Chat : https://bit.ly/2XvahGH", "Lien du discord \"Skript Chat\", qui est le discord officiel de Skript. Vous pourrez y demander de l'aide en anglais, que ce soit sur Skript ou sur des addons", true)
				break;
			case 5:
				embed.addField(":speech_balloon: Forum SkriptMC : https://bit.ly/2DlvqeP", "Forum français de Skript-MC. Vous pourrez y demander des Skript, de l'aide Skript, java ou avec vos serveurs, discuter avec des membres de la communauté ou mettre en ligne vos skript !", true)
					.addField(":computer: GitHub de Skript : https://bit.ly/2W0EJrU", "GitHub officiel de la fork Skript de Bensku. C'est actuellement la seule fork de Skript toujours mise à jour.", true)
				break;
			default:
				embed.setDescription("Voici la liste des liens importants relatifs à Skript. Sommaire :\n:zero: Sommaire\n:one: Liens sur les documentations de Skript\n:two: Liens sur les documentations des addons de Skript\n:three: Liens de téléchargement de Skript et de ses addons\n:four: Liens vers des discord importants\n:five: Divers liens importants")
				break;
		}

		let msgLinks = await message.channel.send(embed);
		if (page === 0) {
			for (let r of reactionsNumb) await msgLinks.react(r);

			const collector = msgLinks
				.createReactionCollector((reaction, user) => user.id === message.author.id && reactionsNumb.includes(reaction.emoji.name))
				.once("collect", reaction => {
					msgLinks.delete();
					if (reaction.emoji.name !== '🇽') commands.find(c => c.title === "Liens importants").execute(message, reactionsNumb.indexOf(reaction.emoji.name));
					else message.delete();
					collector.stop();
				});
		} else {
			for (let r of reactionsPage) await msgLinks.react(r);

			const collector = msgLinks
				.createReactionCollector((reaction, user) => user.id === message.author.id && reactionsPage.includes(reaction.emoji.name))
				.once("collect", reaction => {
					msgLinks.delete();
					if (reaction.emoji.name === '⏮') {
						commands.find(c => c.title === "Liens importants").execute(message, 0);
					} else if (reaction.emoji.name === '◀') {
						const prevPage = page <= 0 ? maxPage : page - 1;
						commands.find(c => c.title === "Liens importants").execute(message, prevPage);
					} else if (reaction.emoji.name === '🇽') {
						message.delete();
					} else if (reaction.emoji.name === '▶') {
						const nextPage = page + 1 > maxPage ? 0 : page + 1;
						commands.find(c => c.title === "Liens importants").execute(message, nextPage);
					} else if (reaction.emoji.name === '⏭') {
						commands.find(c => c.title === "Liens importants").execute(message, maxPage);
					}
					collector.stop();
				});
		}

	}
};
