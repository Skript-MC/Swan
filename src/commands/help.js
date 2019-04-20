/* eslint-disable sort-keys */
import Discord from 'discord.js';
import Config from '../../config/config.json';
import {commands} from '../main.js';

export default {

	title: "Aide",
	description: "Afficher la page d'aide des commandes de Swan.",
	example: "help",
	regex: /aide|help/mu,
	permissions: [],

	execute: async (message, page) => {

		console.log("-----");
		page = page == ".help" ? 0 : page;
		console.log(`page: ${page}`);

		const embed = new Discord.RichEmbed()
			.setTitle(`**__Commandes disponibles (${page + 1}/${commands.length})__**`)
			.setColor(Config.bot.embed)
			.setAuthor("Skript-MC : Aide", "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setThumbnail("https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setFooter("Executé par " + message.author.username);

		console.log("Debug 1");

		let perms = '',
			cmd = commands[page];
		for (let perm of cmd.permissions) perms = `${perms}, ${perm}`;
		perms = perms.replace(/.$/u, "."); // Enlève la virgule a la fin
		perms = perms.slice(2); // Enlève la virgule et l'espace au début
		perms = perms === "" ? "Aucune" : perms;

		console.log("Debug 2");

		embed.addField(`:star: **${cmd.title}**`, `**__Description :__** ${cmd.description}\n**__Exemple d'utilisation :__** \`.${cmd.example}\`\n**__Permission :__** ${perms}`, true);

		let msgHelp = await message.channel.send(embed);
		msgHelp.react('⬅').then(msgHelp.react('➡'));

		console.log("Debug 3");

		const collector = msgHelp.createReactionCollector((reaction, user) => user.id === message.author.id && (reaction.emoji.name === '⬅' || reaction.emoji.name) === '➡').once("collect", reaction => {
			const clicked = reaction.emoji.name;
			console.log("Debug 4");
			if (clicked === '⬅') {
				msgHelp.delete();
				const prevPage = page === 0 ? commands.length : page - 1;
				console.log(`prevPage : ${prevPage}`);
				commands.find(c => c.title === "Aide").execute(message, prevPage);
			} else if (clicked === '➡') {
				msgHelp.delete();
				const nextPage = page + 1 > commands.length ? 0 : page + 1;
				console.log(`nextPage : ${nextPage}`);
				commands.find(c => c.title === "Aide").execute(message, nextPage);
			}
			collector.stop();
		});
	}
};
