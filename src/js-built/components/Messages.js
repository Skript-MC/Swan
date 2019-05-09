import Discord, { RichEmbed, Message } from "discord.js";
import config from '../../config/config.json';

export function success(success) {
    console.log(`[SkriptMc Bot] [Success] ${success}`)
}

export function info(info) {
    console.log(`[SkriptMc Bot] [Information] ${info}`)
}

export function error(error) {
    console.error(`[SkriptMc Bot] [Error] ${error}`)
}

export function discordSuccess(success, message) {
    const embed = new Discord.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570570402615525387/ok.png");
    embed.setTitle('Succès');
    embed.setColor(`${config.messages.success.color}`);
    embed.setDescription(success);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`)
    message.channel.send(embed);
}

export function discordInfo(info, message) {
    const embed = new Discord.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570569077173649438/info_png_704336.png");
    embed.setTitle('Information');
    embed.setColor(`${config.messages.info.color}`);
    embed.setDescription(info);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`);
    message.channel.send(embed);
}

export function discordWarning(warning, message) {
    const embed = new Discord.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/533791418259341315/570722475772608519/warning-icon-md-png-4.png");
    embed.setTitle('Avertissement');
    embed.setColor(`${config.messages.warning.color}`);
    embed.setDescription(warning);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`);
    message.channel.send(embed);    
}

export function discordError(error, message) {
    const embed = new Discord.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570565753044992000/error-icon-4.png");
    embed.setTitle('Erreur');
    embed.setColor(`${config.messages.errors.color}`);
    embed.setDescription(error);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`);
    message.channel.send(embed);
}
