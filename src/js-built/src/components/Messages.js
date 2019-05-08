"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const config_json_1 = __importDefault(require("../../config/config.json"));
function success(success) {
    console.log(`[SkriptMc Bot] [Success] ${success}`);
}
exports.success = success;
function info(info) {
    console.log(`[SkriptMc Bot] [Information] ${info}`);
}
exports.info = info;
function error(error) {
    console.error(`[SkriptMc Bot] [Error] ${error}`);
}
exports.error = error;
function discordSuccess(success, message) {
    const embed = new discord_js_1.default.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570570402615525387/ok.png");
    embed.setTitle('Succès');
    embed.setColor(`${config_json_1.default.messages.success.color}`);
    embed.setDescription(success);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`);
    message.channel.send(embed);
}
exports.discordSuccess = discordSuccess;
function discordInfo(info, message) {
    const embed = new discord_js_1.default.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570569077173649438/info_png_704336.png");
    embed.setTitle('Information');
    embed.setColor(`${config_json_1.default.messages.info.color}`);
    embed.setDescription(info);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`);
    message.channel.send(embed);
}
exports.discordInfo = discordInfo;
function discordWarning(warning, message) {
    const embed = new discord_js_1.default.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/533791418259341315/570722475772608519/warning-icon-md-png-4.png");
    embed.setTitle('Avertissement');
    embed.setColor(`${config_json_1.default.messages.warning.color}`);
    embed.setDescription(warning);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`);
    message.channel.send(embed);
}
exports.discordWarning = discordWarning;
function discordError(error, message) {
    const embed = new discord_js_1.default.RichEmbed();
    embed.setAuthor(message.author.username, message.author.avatarURL);
    embed.setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570565753044992000/error-icon-4.png");
    embed.setTitle('Erreur');
    embed.setColor(`${config_json_1.default.messages.errors.color}`);
    embed.setDescription(error);
    embed.setTimestamp(new Date());
    embed.setFooter(`Executé par ${message.author.username}`);
    message.channel.send(embed);
}
exports.discordError = discordError;
