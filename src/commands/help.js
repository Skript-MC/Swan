/* eslint-disable sort-keys */
import Discord from 'discord.js';
import Config from '../../config/config.json';
import { commands } from '../main.js';

export default {

	title: "Aide",
	description: "Afficher la page d'aide des commandes de Swan.",
	example: "help",
	regex: /aide|help/mu,
	permissions: [],

	execute: async (message, page) => {

		page = page == ".help" ? 0 : page;

		const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
		const embed = new Discord.RichEmbed()
			.setColor(Config.bot.embed)
			.setAuthor(`Commandes disponibles (${page + 1}/${commands.length})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setDescription('‌‌ ') // Caractère invisible (‌‌ )
			.setFooter("Executé par " + message.author.username);

		let perms = '',
			cmd = commands[page];
		for (let perm of cmd.permissions) perms = `${perms}, ${perm}`;
		perms = perms.slice(2); // Enlève la virgule et l'espace au début
		perms = perms === "" ? "Tout le monde." : `${perms}.`;

		embed.addField(`:star: **${cmd.title}**`, `**Description :** ${cmd.description}\n**Exemple d'utilisation :** \`.${cmd.example}\`\n**Utilisable par :** ${perms}\n‌‌ `, true);

		let msgHelp = await message.channel.send(embed);
		for (let r of reactions) await msgHelp.react(r);

		const collector = msgHelp.createReactionCollector((reaction, user) => user.id === message.author.id && reactions.includes(reaction.emoji.name)).once("collect", reaction => {
			msgHelp.delete();
			if (reaction.emoji.name === '⏮') {
				commands.find(c => c.title === "Aide").execute(message, 0);
			} else if (reaction.emoji.name === '◀') {
				const prevPage = page <= 0 ? commands.length - 1 : page - 1;
				commands.find(c => c.title === "Aide").execute(message, prevPage);
			} else if (reaction.emoji.name === '🇽') {
				message.delete();
			} else if (reaction.emoji.name === '▶') {
				const nextPage = page + 1 >= commands.length ? 0 : page + 1;
				commands.find(c => c.title === "Aide").execute(message, nextPage);
			} else if (reaction.emoji.name === '⏭') {
				commands.find(c => c.title === "Aide").execute(message, commands.length - 1);
			}
			collector.stop();
		});
	}
};
