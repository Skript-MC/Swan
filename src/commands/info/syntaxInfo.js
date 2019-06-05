import { RichEmbed } from "discord.js";
import Command from "../../components/Command";
import { discordError } from "../../components/Messages";
import { SkriptHubSyntaxes, client } from '../../main';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
const regexAddon = new RegExp(/-a(?:dd?on)?:/, 'gimu');
const regexType = new RegExp(/-t(?:ype)?:/, 'gimu');
const regexID = new RegExp(/-i(?:d)?:/, 'gimu');

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function computeScore(score) {
	if (score < -5) return "Très mauvais";
	else if (score < 0) return "Mauvais";
	else if (score === 0) return "Neutre";
	else if (score > 5) return "Très bon";
	else if (score > 0) return "Bon";
	else return "Inconnu";
}

function getInfos(data) {
	const infos = [];
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
		infos.push(`Requiert : ${data.addon} (v${data.compatible_addon_version.replace(/unknown\s*/gimu, '').replace('(', '').replace(')', '')})`);
	else if (data.addon)
		infos.push(`Requiert : ${data.addon}`);
	if (data.compatible_minecraft_version)
		infos.push(`Version minecraft : ${data.compatible_minecraft_version}`);
	if (data.required_plugins.length === 1)
		infos.push(`Plugin requis : ${data.required_plugins.name}`);
	else if (data.required_plugins.length > 1) {
		const pl = []
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

async function sendEmbed(message, data) {
	const embed = new RichEmbed()
		.setColor(config.bot.color)
		.setAuthor(`Informations sur "${data.title}"`, client.user.avatarURL)
		.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripthub.net`)
		.setDescription("	‌") // Caractère invisible
		.addField(this.config.embed.patternTitle, `${this.config.embed.patternDesc.replace('%s', `${data.syntax_pattern}`) || this.config.embed.noPattern}\n	‌`, false)
		.addField(this.config.embed.descriptionTitle, `${data.description || this.config.embed.noDescription}\n	‌`, false);
	
	if (data.example) {
		let ex = `${this.config.embed.exampleDesc.replace('%s', data.example.example_code)}\n`;
		if (data.example.example_author) ex += `Auteur : ${data.example.example_author}\n`;
		if (data.example.score) ex += `Appréciation : ${computeScore(data.example.score)}\n`;
		if (data.example.offical_example === true) ex += 'Exemple officiel.';
		embed.addField(this.config.embed.exampleTitle, `${ex}\n	‌`, false);
	}

	const infos = getInfos(data);
	if (infos.length !== 0)
		embed.addField(conf.embed.infos, infos, false);

	const msg = await message.channel.send(embed);
	const collectorStop = msg
		.createReactionCollector((reaction, user) => !user.bot && user.id === message.author.id && reaction.emoji.name === '❌')
		.once("collect", () => {
			message.delete();
			msg.delete();
			collectorStop.stop();
		});
}


class SyntaxInfo extends Command {

	constructor () {
		super('Syntaxe Info');
		this.usage = 'syntax-info [-a:<addon>] [-t:<type>] [-id:<ID skripthub>]';
		this.example = 'doc tablist -type:effect -addon:skrayfall';
		this.permissions.push('Staff');
		this.regex = /(?:s(?:yntax)?-?infos?|doc(?:umentation)?s?)/gimu;
		this.allowedChannels = [];
	}

	async execute(message, args) {
		if (args.length < 1) {
			discordError(conf.invalidCmd, message);
		} else {
			let msg = await message.channel.send("Je vais chercher ça...");
			const syntaxes = await SkriptHubSyntaxes;

			const search = [];
			let arg = args.join(' ').toUpperCase();
			let addon, type, id;
			for (let a of args) {
				if (a.match(regexAddon)) {
					addon = a.replace(regexAddon, "");
					arg = arg.replace(/\s?-a(?:dd?on)?:\w+\s?/gimu, '');
					search.push(`addon : ${addon}`);
				} else if (a.match(regexType)) {
					type = a.replace(regexType, "");
					arg = arg.replace(/\s?-t(?:ype)?:\w+\s?/gimu, '');
					search.push(`type : ${type}`);
				} else if (a.match(regexID)) {
					id = Number.parseInt(a.replace(regexID, ""));
					arg = arg.replace(/\s?-i(?:d)?:\w+\s?/gimu, '');
					if (Number.isNaN(id)) id = undefined;
					else search.push(`id : ${id}`);
				}
			}

			if (arg === '') return discordError(conf.invalidCmd, message);

			let matchingSyntaxes = syntaxes.filter(elt => elt.title.toUpperCase().includes(arg)) ||
								   syntaxes.filter(elt => elt.description.toUpperCase().includes(arg));
			if (addon)
				matchingSyntaxes = matchingSyntaxes.filter(elt => elt.addon.toUpperCase().includes(addon.toUpperCase()));
			if (type)
				matchingSyntaxes = matchingSyntaxes.filter(elt => elt.syntax_type.toUpperCase().includes(type.toUpperCase()));
			if (id)
				matchingSyntaxes = matchingSyntaxes.filter(elt => elt.id === id);

			const results = matchingSyntaxes.length;
			// On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
			matchingSyntaxes = matchingSyntaxes.slice(0, 10);
			
			if (matchingSyntaxes.length === 0) {
				await msg.delete();
				return discordError(conf.syntaxDoesntExist, message);
			} else if (matchingSyntaxes.length === 1) {
				msg.delete();
				return sendEmbed(message, matchingSyntaxes[0]);
			} else {
				await msg.edit(`${results} élements trouvés pour la recherche \`${args.join(' ')}\`${search.length > 0 ? ` avec comme paramètres \`${search.join(', ')}\`` : ''}. Quelle syntaxe vous interesse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
				for (let i = 0; i < matchingSyntaxes.length; i++) {
					msg = await msg.edit(`${msg.content}\n${reactionsNumbers[i]} \"${capitalizeFirstLetter(matchingSyntaxes[i].title)}\" *(${matchingSyntaxes[i].syntax_type}, ${matchingSyntaxes[i].addon})*`);
					await msg.react(reactionsNumbers[i]);
				}
				if (results - 10 > 0) msg = await msg.edit(`${msg.content}\n...et ${results - 10} de plus...`);
				await msg.react('❌');

				const collectorNumbers = msg
					.createReactionCollector((reaction, user) => !user.bot && user.id === message.author.id && reactionsNumbers.includes(reaction.emoji.name))
					.once("collect", reaction => {
						msg.delete();
						sendEmbed(message, matchingSyntaxes[reactionsNumbers.indexOf(reaction.emoji.name)]);
						collectorNumbers.stop();
					});

				const collectorStop = msg
					.createReactionCollector((reaction, user) => !user.bot && user.id === message.author.id && reaction.emoji.name === '❌')
					.once("collect", () => {
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
