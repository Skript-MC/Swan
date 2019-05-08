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
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../../config/config.json"));
const Command_1 = __importDefault(require("../components/Command"));
const main_1 = require("../main");
const Messages_1 = require("../components/Messages");
const conf = config_json_1.default.messages.commands.help;
const reactions = ["⏮", "◀", "🇽", "▶", "⏭"];
const cmdPerPage = config_json_1.default.miscellaneous.cmdPerPagesInHelp;
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
function sendEmbed(message, command) {
    return __awaiter(this, void 0, void 0, function* () {
        const embed = new discord_js_1.RichEmbed()
            .setColor(config_json_1.default.bot.color)
            .setAuthor(`Informations sur "${command.name}"`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
            .setFooter(`Executé par ${message.author.username} | Données fournies par https://skripthub.net`);
        let perms = "";
        for (let perm of command.permissions)
            perms = `${perms}, ${perm}`;
        perms = perms.slice(2); // Enlève la virgule et l'espace au début
        perms = perms === "" ? "Tout le monde." : `${perms}.`;
        let ex = "";
        for (let e of command.examples)
            ex = `${ex} | \`${config_json_1.default.bot.prefix}${e}\``;
        ex = ex.slice(3, ex.length - 1); // Enlève les espaces et la barre au début, et l'espace et le ` à la fin.
        ex = ex === "" ? "Aucun exemple disponible." : `${ex}`;
        let desc = command.longDescription;
        if (command.name === 'Messages automatiques') {
            desc = desc.replace('%s', `${Object.keys(config_json_1.default.messages.commands.auto.commands).join(', ')}`);
        }
        embed.addField(`:star: **${command.name}**`, `**Description :** ${desc}\n**Utilisation :** ${command.usage}\n**Exemple d'utilisation :** ${ex}\`\n**Utilisable par :** ${perms}\n‌‌ `, true);
        message.channel.send(embed);
    });
}
class Help extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = "Aide";
        this.shortDescription = config_json_1.default.messages.commands.help.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.help.longDesc;
        this.usage = `help [commande]`;
        this.examples = ['help'];
        this.regex = /(?:aide|help)/gimu;
        this.execute = (message, args, page) => __awaiter(this, void 0, void 0, function* () {
            page = Number.isInteger(page) ? page : 0;
            const allCmds = yield main_1.commands;
            const totalPages = Math.ceil(allCmds.length / cmdPerPage);
            // S'il n'y a pas d'arguments, on montre la liste de toutes les commandes
            if (args.length === 0) {
                const embed = new discord_js_1.RichEmbed()
                    .setColor(config_json_1.default.bot.color)
                    .setAuthor(`${allCmds.length} commandes disponibles (page ${page + 1}/${totalPages})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128" + "")
                    .setDescription(config_json_1.default.messages.commands.help.header)
                    .setFooter("Executé par " + message.author.username);
                //⁕※⌶⎪►▷◉◈
                for (let i = 0; i < cmdPerPage && i < page * cmdPerPage + cmdPerPage && page * cmdPerPage + i <= allCmds.length - 1; i++) {
                    const cmd = allCmds[page * cmdPerPage + i];
                    embed.addField(`${cmd.name} ⁕ ${config_json_1.default.bot.prefix}${cmd.usage}`, `${cmd.shortDescription}`, false);
                }
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
                        const prevPage = page <= 0 ? totalPages - 1 : page - 1;
                        this.execute(message, args, prevPage);
                    }
                    else if (reaction.emoji.name === "🇽") {
                        message.delete();
                    }
                    else if (reaction.emoji.name === "▶") {
                        const nextPage = page + 1 >= totalPages ? 0 : page + 1;
                        this.execute(message, args, nextPage);
                    }
                    else if (reaction.emoji.name === "⏭") {
                        this.execute(message, args, totalPages - 1);
                    }
                    collector.stop();
                });
                // S'il y a un argument, on recherche la commande demandée
            }
            else {
                let cmds = allCmds.filter(elt => elt.name.toUpperCase().includes(args.join(' ').toUpperCase()));
                const results = cmds.length;
                // On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
                cmds = cmds.slice(0, 10);
                if (cmds.length === 0) {
                    return Messages_1.discordError(conf.cmdDoesntExist, message);
                }
                else if (cmds.length === 1) {
                    return sendEmbed(message, cmds[0]);
                }
                else {
                    let msgHub = yield message.channel.send(`${results} élements trouvés pour la recherche \`${args.join(' ')}\`. Quelle commande vous intéresse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
                    for (let i = 0; i < cmds.length; i++) {
                        msgHub = (yield msgHub.edit(`${msgHub.content}\n${reactionsNumbers[i]} \"${cmds[i].name}\" (\`${cmds[i].usage}\`)`));
                        yield msgHub.react(reactionsNumbers[i]);
                    }
                    yield msgHub.react('❌');
                    const collectorNumbers = msgHub
                        .createReactionCollector((reaction, user) => !user.bot &&
                        user.id === message.author.id &&
                        reactionsNumbers.includes(reaction.emoji.name)).once("collect", reaction => {
                        msgHub.delete();
                        sendEmbed(message, cmds[reactionsNumbers.indexOf(reaction.emoji.name)]);
                        collectorNumbers.stop();
                    });
                    const collectorStop = msgHub
                        .createReactionCollector((reaction, user) => !user.bot &&
                        user.id === message.author.id &&
                        reaction.emoji.name === '❌').once("collect", () => {
                        message.delete();
                        msgHub.delete();
                        collectorNumbers.stop();
                        collectorStop.stop();
                    });
                }
            }
        });
    }
}
exports.default = Help;
