"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const config_json_1 = __importDefault(require("../../config/config.json"));
const Command_1 = __importDefault(require("../components/Command"));
const main_1 = require("../main");
class Help extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = "Aide";
        this.description = config_json_1.default.messages.commands.help.description;
        this.examples = ["help"];
        this.regex = /(?:aide|help)/gimu;
        this.execute = (message, args, page) => __awaiter(this, void 0, void 0, function* () {
            page = Number.isInteger(page) ? page : 0;
            const allCmds = yield main_1.commands;
            const total = allCmds.length;
            const reactions = ["⏮", "◀", "🇽", "▶", "⏭"];
            const embed = new discord_js_1.default.RichEmbed()
                .setColor(config_json_1.default.bot.color)
                .setAuthor(`Commandes disponibles (${page + 1}/${total})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128" + "")
                .setDescription("‌‌ ") // Caractère invisible (‌‌ )
                .setFooter("Executé par " + message.author.username);
            const cmd = allCmds[page];
            let perms = "";
            for (let perm of cmd.permissions)
                perms = `${perms}, ${perm}`;
            perms = perms.slice(2); // Enlève la virgule et l'espace au début
            perms = perms === "" ? "Tout le monde." : `${perms}.`;
            let ex = "";
            for (let e of cmd.examples)
                ex = `${ex} | \`${config_json_1.default.bot.prefix}${e}\``;
            ex = ex.slice(3, ex.length - 1); // Enlève les espaces et la barre au début, et l'espace et le ` à la fin.
            ex = ex === "" ? "Aucun exemple disponible." : `${ex}`;
            embed.addField(`:star: **${cmd.name}**`, `**Description :** ${cmd.description}\n**Exemple d'utilisation :** ${ex}\`\n**Utilisable par :** ${perms}\n‌‌ `, true);
            const msgHelp = yield message.channel.send(embed);
            for (let r of reactions)
                yield msgHelp.react(r);
            const collector = msgHelp
                .createReactionCollector((reaction, user) => user.id === message.author.id &&
                reactions.includes(reaction.emoji.name))
                .once("collect", reaction => {
                msgHelp.delete();
                if (reaction.emoji.name === "⏮") {
                    this.execute(message, args, 0);
                }
                else if (reaction.emoji.name === "◀") {
                    const prevPage = page <= 0 ? allCmds.length - 1 : page - 1;
                    this.execute(message, args, prevPage);
                }
                else if (reaction.emoji.name === "🇽") {
                    message.delete();
                }
                else if (reaction.emoji.name === "▶") {
                    const nextPage = page + 1 >= allCmds.length ? 0 : page + 1;
                    this.execute(message, args, nextPage);
                }
                else if (reaction.emoji.name === "⏭") {
                    this.execute(message, args, allCmds.length - 1);
                }
                collector.stop();
            });
        });
    }
}
exports.default = Help;
