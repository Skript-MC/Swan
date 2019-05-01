import { Message, RichEmbed, ReactionCollector } from "discord.js";
import config from "../../config/config.json";
import Command from "../components/Command";
import { discordError } from "../components/Messages";
import { SkriptHubSyntaxes } from '../main';

const conf = config.messages.commands.syntaxInfo;
const reactionsNumbers: Array<string> = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
const regexAddon: RegExp = new RegExp(/-a(?:dd?on)?:/, 'gimu');
const regexType: RegExp = new RegExp(/-t(?:ype)?:/, 'gimu');
const regexID: RegExp = new RegExp(/-i(?:d)?:/, 'gimu');

function computeScore(score: number): string {
	console.log(score);
	console.log(score + 1);
	if (score < -5) return "Très mauvais";
	else if (score < 0) return "Mauvais";
	else if (score === 0) return "Neutre";
	else if (score > 5) return "Très bon";
	else if (score > 0) return "Bon";
}

function getInfos(data: any): Array<string> {
	const infos: Array<string> = [];
	if (data.syntax_type)
		infos.push(`Type de la syntaxe : ${data.syntax_type}`);
	if (data.return_type)
		infos.push(`Type de la valeur retournée : \`${data.return_type}\``);
	if (data.syntax_type === "event" && data.event_cancellable)
		infos.push(`Évènement annulable : ${data.event_cancellable ? "Oui" : "Non"}`);
	if (data.syntax_type === "event" && data.event_values)
		infos.push(`Valeurs utilisables dans l'évènement : \`${data.event_values}\``);
	if (data.syntax_type === "type" && data.type_usage)
		infos.push(`Utilisation du type : \`${data.type_usage}\``);
	if (data.addon && data.compatible_addon_version)
		infos.push(`Requiert : ${data.addon} (v${data.compatible_addon_version}+)`);
	else if (data.addon)
		infos.push(`Requiert : ${data.addon}`);
	if (data.compatible_minecraft_version)
		infos.push(`Version minecraft : ${data.compatible_minecraft_version}`);
	if (data.required_plugins.length === 1)
		infos.push(`Plugin requis : ${data.required_plugins.name}`);
	else if (data.required_plugins.length > 1) {
		const pl: Array<any> = []
		for (let p of data.required_plugins)
			pl.push(p.name);
		infos.push(`Plugins requis : ${pl.join(', ')}`);
	}
	if (data.id)
		infos.push(`ID SkriptHub : ${data.id}`);
	if (data.link)
		infos.push(`Lien : ${data.link}`);
	return infos;
}

async function sendEmbed(message: Message, data: any) {
	const embed: RichEmbed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur "${data.title}"`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
		.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripthub.net`)
		.addField(conf.embed.patternTitle, conf.embed.patternDesc.replace('%s', `${data.syntax_pattern}`) || conf.embed.noPattern, false)
		.addField(conf.embed.descriptionTitle, data.description || conf.embed.noDescription, false)
	if (data.example) {
		let ex: string = `${conf.embed.exampleDesc.replace('%s', data.example.example_code)}\n`;
		if (data.example.example_author) ex += `Auteur : ${data.example.example_author}\n`;
		if (data.example.score) ex += `Appréciation : ${computeScore(data.example.score)}\n`;
		if (data.example.offical_example === true) ex += 'Exemple officiel.';
		embed.addField(conf.embed.exampleTitle, ex, false);
	}
	const infos: Array<string> = getInfos(data);
	if (infos.length !== 0)
		embed.addField(conf.embed.infos, infos, false);

	message.channel.send(embed);
}

class SyntaxInfo extends Command {

	name: string = 'Syntaxe';
	description: string = conf.description;
	examples: string[] = ['syntax-info join', 's-info tablist', 'sinfo tablist -addon:skrayfall', 'sinfo -id:2000', 'sinfo join -type:event'];
	regex: RegExp = /s(?:yntaxe?)?-?infos?/gimu;

	execute = async (message: Message, args: string[]): Promise<void> => {
		if (args.length < 1) {
			discordError(conf.invalidCmd, message);
		} else {
			const syntaxes: any[] = await SkriptHubSyntaxes;

			let msg: Message = <Message> await message.channel.send("Je vais chercher ça...");

			let arg: string = args.join(' ').toUpperCase();					
			let addon: string, type: string, id: number;
			for (let a of args) {
				if (a.match(regexAddon)) {
					addon = a.replace(regexAddon, "");
					arg = arg.replace(new RegExp(/\s?-a(?:dd?on)?:\w+\s?/, 'gimu'), '');
				}
				else if (a.match(regexType)) {
					type = a.replace(regexType, "");
					arg = arg.replace(new RegExp(/\s?-t(?:ype)?:\w+\s?/, 'gimu'), '');
				}
				else if (a.match(regexID)) {
					id = Number.parseInt(a.replace(regexID, ""));
					if (Number.isNaN(id)) id = undefined;
					arg = arg.replace(new RegExp(/\s?-i(?:d)?:\w+\s?/, 'gimu'), '');
				}
			}
			let matchingSyntaxes: any[] = syntaxes.filter(elt => elt.title.toUpperCase().includes(arg)) ||
										syntaxes.filter(elt => elt.description.toUpperCase().includes(arg));
			
			if (addon)
				matchingSyntaxes = matchingSyntaxes.filter(elt => elt.addon.toUpperCase().includes(addon.toUpperCase()));
			if (type)
				matchingSyntaxes = matchingSyntaxes.filter(elt => elt.syntax_type.toUpperCase().includes(type.toUpperCase()));
			if (id)
				matchingSyntaxes = matchingSyntaxes.filter(elt => elt.id === id);

			// On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
			matchingSyntaxes = matchingSyntaxes.slice(0, 10);
			
			if (matchingSyntaxes.length === 0) {
				await msg.delete();
				return discordError(conf.syntaxDoesntExist, message);
			} else if (matchingSyntaxes.length === 1) {
				msg.delete();
				return sendEmbed(message, matchingSyntaxes[0]);
			} else {
				await msg.edit(`${matchingSyntaxes.length} élements trouvés pour la recherche \`${arg}\`. Quelle syntaxe vous interesse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
				for (let i: number = 0; i < matchingSyntaxes.length; i++) {
					msg = <Message> await msg.edit(`${msg.content}\n${reactionsNumbers[i]} \"${matchingSyntaxes[i].title}\" (${matchingSyntaxes[i].addon})`);
					await msg.react(reactionsNumbers[i]);
				}
				await msg.react('❌');

				const collectorNumbers: ReactionCollector = msg
					.createReactionCollector((reaction, user) =>
						!user.bot &&
						user.id === message.author.id &&
						reactionsNumbers.includes(reaction.emoji.name)
					).once("collect", reaction => {
						msg.delete();
						sendEmbed(message, matchingSyntaxes[reactionsNumbers.indexOf(reaction.emoji.name)]);
						collectorNumbers.stop();
					});

				const collectorStop: ReactionCollector = msg
					.createReactionCollector((reaction, user) =>
						!user.bot &&
						user.id === message.author.id &&
						reaction.emoji.name === '❌'
					).once("collect", () => {
						message.delete();
						msg.delete();
						collectorNumbers.stop();
						collectorStop.stop();
					});
			}
			
		}
	}
};

export default SyntaxInfo;
