import { Message, RichEmbed, ReactionCollector } from "discord.js";
import config from "../../../config/config.json";
import Command from "../components/Command";
import { commands } from "../main";
import { discordError } from "../components/Messages";

const conf = config.messages.commands.help;
const reactions = ["⏮", "◀", "🇽", "▶", "⏭"];
const cmdPerPage = config.miscellaneous.cmdPerPagesInHelp;
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

async function sendEmbed(message, command) {
	const embed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur "${command.name}"`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
		.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripthub.net`)

	let perms = "";
	for (let perm of command.permissions)
		perms = `${perms}, ${perm}`;
	perms = perms.slice(2); // Enlève la virgule et l'espace au début
	perms = perms === "" ? "Tout le monde." : `${perms}.`;
	
	let ex = "";
	for (let e of command.examples)
		ex = `${ex} | \`${config.bot.prefix}${e}\``;
	ex = ex.slice(3, ex.length - 1); // Enlève les espaces et la barre au début, et l'espace et le ` à la fin.
	ex = ex === "" ? "Aucun exemple disponible." : `${ex}`;

	let desc = command.longDescription
	if (command.name === 'Messages automatiques') {
		desc = desc.replace('%s', `${Object.keys(config.messages.commands.auto.commands).join(', ')}`);
	}
	embed.addField(`:star: **${command.name}**`, `**Description :** ${desc}\n**Utilisation :** ${command.usage}\n**Exemple d'utilisation :** ${ex}\`\n**Utilisable par :** ${perms}\n‌‌ `, true);

	message.channel.send(embed);
}

class Help extends Command {
	
	name = "Aide";
	shortDescription = config.messages.commands.help.shortDesc;
	longDescription = config.messages.commands.help.longDesc;
	usage = `${config.bot.prefix}help [commande]`;
	examples = ['help'];
	regex = /(?:aide|help)/gimu;

	execute = async (message, args, page) => {
		page = Number.isInteger(page) ? page : 0;

		const allCmds = await commands;
		const totalPages = Math.ceil(allCmds.length / cmdPerPage);

		// S'il n'y a pas d'arguments, on montre la liste de toutes les commandes
		if (args.length === 0) {
			const embed = new RichEmbed()
				.setColor(config.bot.color)
				.setAuthor(`${allCmds.length} commandes disponibles (page ${page + 1}/${totalPages})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128" + "")
				.setDescription(config.messages.commands.help.header)
				.setFooter("Executé par " + message.author.username);
			//⁕※⌶⎪►▷◉◈
			for (let i = 0; i < cmdPerPage && i < page * cmdPerPage + cmdPerPage && page * cmdPerPage + i <= allCmds.length - 1; i++) {
				const cmd = allCmds[page * cmdPerPage + i];
				embed.addField(`${cmd.name} ⁕ ${cmd.usage}`, `${cmd.shortDescription}`, false);
			}
			const msgHelp = await message.channel.send(embed);
			for (let r of reactions) await msgHelp.react(r);

			const collector = msgHelp
				.createReactionCollector(
					(reaction, user) =>
						user.id === message.author.id &&
						reactions.includes(reaction.emoji.name)
				)
				.once("collect", reaction => {
					msgHelp.delete();
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
		// S'il y a un argument, on recherche la commande demandée
		} else {
			let cmds = allCmds.filter(elt => elt.name.toUpperCase().includes(args.join(' ').toUpperCase()));
			
			const results = cmds.length;

			// On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
			cmds = cmds.slice(0, 10);
			
			if (cmds.length === 0) {
				return discordError(conf.cmdDoesntExist, message);
			} else if (cmds.length === 1) {
				return sendEmbed(message, cmds[0]);
			} else {
				let msgHub = await message.channel.send(`${results} élements trouvés pour la recherche \`${args.join(' ')}\`. Quelle commande vous intéresse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
				for (let i = 0; i < cmds.length; i++) {
					msgHub = await msgHub.edit(`${msgHub.content}\n${reactionsNumbers[i]} \"${cmds[i].name}\" (\`${cmds[i].usage}\`)`);
					await msgHub.react(reactionsNumbers[i]);
				}
				await msgHub.react('❌');

				const collectorNumbers = msgHub
					.createReactionCollector((reaction, user) =>
						!user.bot &&
						user.id === message.author.id &&
						reactionsNumbers.includes(reaction.emoji.name)
					).once("collect", reaction => {
						msgHub.delete();
						sendEmbed(message, cmds[reactionsNumbers.indexOf(reaction.emoji.name)]);
						collectorNumbers.stop();
					});

				const collectorStop = msgHub
					.createReactionCollector((reaction, user) =>
						!user.bot &&
						user.id === message.author.id &&
						reaction.emoji.name === '❌'
					).once("collect", () => {
						message.delete();
						msgHub.delete();
						collectorNumbers.stop();
						collectorStop.stop();
					});
			}
		}
	};
}

export default Help;
