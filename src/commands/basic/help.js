import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import { commands, config } from '../../main';
import { discordError } from "../../components/Messages";

const reactions = ["⏮", "◀", "🇽", "▶", "⏭"];
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
const cmdPerPage = config.miscellaneous.cmdPerPagesInHelp;

class Help extends Command {

	constructor () {
		super('help');
		this.regex = /(help|aide)/gmui;
		this.usage = 'help [<la commande>]';
		this.example = 'help help';
	}

	async execute(message, args, page) {
		page = Number.isInteger(page) ? page : 0;
		const totalPages = Math.ceil(commands.length / cmdPerPage);

		// S'il n'y a pas d'arguments, on montre la liste de toutes les commandes
		if (args.length === 0) {
			const embed = new RichEmbed()
				.setAuthor(`${commands.length} commandes disponibles (page ${page + 1}/${totalPages})`, config.avatar)
				.setDescription(config.messages.commands.help.header)
				.setFooter("Executé par " + message.author.username);
			for (let i = 0; i < cmdPerPage && i < page * cmdPerPage + cmdPerPage && page * cmdPerPage + i <= commands.length - 1; i++) {
				const cmd = commands[page * cmdPerPage + i];
				embed.addField(`${cmd.name} ⁕ ${cmd.usage} ${cmd.permissions.some(role => role === "Staff") > 0 ? ":octagonal_sign:" : ""}`, `${cmd.help}`, false);
			}

			// Envoyer l'embed, ajouter les réactions, puis modifier sa couleur en bleu
			let helpEmbed = await message.channel.send(embed);
			for (let r of reactions) await helpEmbed.react(r);
			embed.setColor(config.bot.color)
			helpEmbed.edit(embed);

			const collector = helpEmbed
				.createReactionCollector(
					(reaction, user) =>
						user.id === message.author.id &&
						reactions.includes(reaction.emoji.name)
				).once("collect", reaction => {
					helpEmbed.delete();
					if (reaction.emoji.name === "⏮") {
						this.execute(message, args, 0);
					} else if (reaction.emoji.name === "◀") {
						const prevPage = page <= 0 ? totalPages - 1 : page - 1;
						this.execute(message, args, prevPage);
					} else if (reaction.emoji.name === "🇽") {
						message.delete();
					} else if (reaction.emoji.name === "▶") {
						const nextPage = page + 1 >= totalPages ? 0 : page + 1;
						this.execute(message, args, nextPage);
					} else if (reaction.emoji.name === "⏭") {
						this.execute(message, args, totalPages - 1);
					}
					collector.stop();
				});
		} else {
			let cmds = commands.filter(elt => elt.name.toUpperCase().includes(args.join(' ').toUpperCase()));
			const results = cmds.length;

			// On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
			cmds = cmds.slice(0, 10);
			
			if (results === 0) {
				return discordError(config.messages.commands.help.cmdDoesntExist, message);
			} else if (results === 1) {
				return this.sendDetails(message, cmds[0]);
			} else {
				let selectorMsg = await message.channel.send(`${results} élements trouvés pour la recherche \`${args.join(' ')}\`. Quelle commande vous intéresse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
				for (let i = 0; i < results; i++) {
					selectorMsg = await selectorMsg.edit(`${selectorMsg.content}\n${reactionsNumbers[i]} \"${cmds[i].name}\" (\`${cmds[i].usage}\`)`);
					await selectorMsg.react(reactionsNumbers[i]);
				}
				await selectorMsg.react('❌');

				const collectorNumbers = selectorMsg
					.createReactionCollector((reaction, user) =>
						!user.bot &&
						user.id === message.author.id &&
						reactionsNumbers.includes(reaction.emoji.name)
					).once("collect", reaction => {
						selectorMsg.delete();
						this.sendDetails(message, cmds[reactionsNumbers.indexOf(reaction.emoji.name)]);
						collectorNumbers.stop();
					});

				const collectorStop = selectorMsg
					.createReactionCollector((reaction, user) =>
						!user.bot &&
						user.id === message.author.id &&
						reaction.emoji.name === '❌'
					).once("collect", () => {
						message.delete();
						selectorMsg.delete();
						collectorNumbers.stop();
						collectorStop.stop();
					});
			}
		}
	}

	async sendDetails(message, command) {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Informations sur "${command.name}"`, config.bot.avatar)
			.setFooter(`Executé par ${message.author.username}`)
			.setTimestamp();

		let perms = "Tout le monde.";
		if (command.permissions.length > 0)
			perms = command.permissions.join(', ');
		
		let ex = command.example || "Aucun exemple disponible.";
	
		let desc = command.description
		if (command.name === 'Automatic Messages') {
			desc = desc.replace('%s', `${Object.keys(config.messages.commands.automatic_messages.commands).join(', ')}`);
		}

		let channels = [];
		if (command.allowedChannels.length === 0) {
			channels.push("Tous");
		} else {
			for (let id of command.allowedChannels) {
				channels.push(message.guild.channels.get(id).name);
			}
		}
		embed.addField(`:star: **${command.name}**`, `**Description :** ${desc}\n**Catégorie :** ${command.category}\n**Utilisation :** ${command.usage}\n**Exemple d'utilisation :** ${ex}\n**Utilisable par :** ${perms}\n**Channels :** ${channels.join(", ")}\n‌‌ `, true);
	
		message.channel.send(embed);
	}
}

export default Help;
