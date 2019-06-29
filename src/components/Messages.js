import { RichEmbed } from "discord.js";
import { config } from '../main';

export function success(success) {
	console.log(`[SkriptMc Bot] ✔️  ${success}`);
}

export function discordSuccess(success, message) {
	const embed = new RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570570402615525387/ok.png")
		.setTitle('Succès')
		.setColor(`${config.messages.success.color}`)
		.setDescription(success)
		.setTimestamp()
		.setFooter(`Executé par ${message.author.username}`);
	message.channel.send(embed);
}

export function discordInfo(info, message) {
	const embed = new RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570569077173649438/info_png_704336.png")
		.setTitle('Information')
		.setColor(`${config.messages.info.color}`)
		.setDescription(info)
		.setTimestamp()
		.setFooter(`Executé par ${message.author.username}`);
	message.channel.send(embed);
}

export function discordWarning(warning, message) {
	const embed = new RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setThumbnail("https://cdn.discordapp.com/attachments/533791418259341315/570722475772608519/warning-icon-md-png-4.png")
		.setTitle('Avertissement')
		.setColor(`${config.messages.warning.color}`)
		.setDescription(warning)
		.setTimestamp()
		.setFooter(`Executé par ${message.author.username}`);
	message.channel.send(embed);
}

export function discordError(error, message) {
	const embed = new RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570565753044992000/error-icon-4.png")
		.setTitle('Erreur')
		.setColor(`${config.messages.errors.color}`)
		.setDescription(error)
		.setTimestamp()
		.setFooter(`Executé par ${message.author.username}`);
	message.channel.send(embed);
}
