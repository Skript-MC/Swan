import Discord, { Message } from "discord.js";
import config from "../../config/config.json";
import Command from "../components/Command";
import { commands } from "../main";

class Help extends Command {
	
	name: string = "Aide";
	description: string = config.messages.commands.help.description;
	examples: string[] = ["help"];
	regex: RegExp = /(?:aide|help)/gimu;

	execute = async (message: Message, args: string[], page?: number): Promise<void> => {
	   
		page = Number.isInteger(page) ? page : 0;
	   
		const allCmds: Command[] = await commands;
		const total: number = allCmds.length;
		const reactions: string[] = ["⏮", "◀", "🇽", "▶", "⏭"];
		const embed: Discord.RichEmbed = new Discord.RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Commandes disponibles (${page + 1}/${total})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128" + "")
			.setDescription("‌‌ ") // Caractère invisible (‌‌ )
			.setFooter("Executé par " + message.author.username);

		const cmd: any = allCmds[page];

		let perms: string = "";
		for (let perm of cmd.permissions) perms = `${perms}, ${perm}`;
		perms = perms.slice(2); // Enlève la virgule et l'espace au début
		perms = perms === "" ? "Tout le monde." : `${perms}.`;

		let ex: string = "";
		for (let e of cmd.examples) ex = `${ex} | \`${config.bot.prefix}${e}\``;
		ex = ex.slice(3, ex.length - 1); // Enlève les espaces et la barre au début, et l'espace et le ` à la fin.
		ex = ex === "" ? "Aucun exemple disponible." : `${ex}`;

		embed.addField(`:star: **${cmd.name}**`, `**Description :** ${cmd.description}\n**Exemple d'utilisation :** ${ex}\`\n**Utilisable par :** ${perms}\n‌‌ `,true);

		const msgHelp: Message = <Message> await message.channel.send(embed);
		for (let r of reactions) await msgHelp.react(r);

		const collector: Discord.ReactionCollector = msgHelp
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
					const prevPage: number = page <= 0 ? allCmds.length - 1 : page - 1;
					this.execute(message, args, prevPage);
				} else if (reaction.emoji.name === "🇽") {
					message.delete();
				} else if (reaction.emoji.name === "▶") {
					const nextPage: number = page + 1 >= allCmds.length ? 0 : page + 1;
					this.execute(message, args, nextPage);
				} else if (reaction.emoji.name === "⏭") {
					this.execute(message, args, allCmds.length - 1);
				}
				collector.stop();
			});
	};
}

export default Help;
