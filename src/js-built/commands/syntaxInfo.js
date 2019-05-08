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
const Messages_1 = require("../components/Messages");
const main_1 = require("../main");
const conf = config_json_1.default.messages.commands.syntaxInfo;
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
const regexAddon = new RegExp(/-a(?:dd?on)?:/, 'gimu');
const regexType = new RegExp(/-t(?:ype)?:/, 'gimu');
const regexID = new RegExp(/-i(?:d)?:/, 'gimu');
function computeScore(score) {
    console.log(score);
    console.log(score + 1);
    if (score < -5)
        return "Très mauvais";
    else if (score < 0)
        return "Mauvais";
    else if (score === 0)
        return "Neutre";
    else if (score > 5)
        return "Très bon";
    else if (score > 0)
        return "Bon";
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
        infos.push(`Requiert : ${data.addon} (v${data.compatible_addon_version}+)`);
    else if (data.addon)
        infos.push(`Requiert : ${data.addon}`);
    if (data.compatible_minecraft_version)
        infos.push(`Version minecraft : ${data.compatible_minecraft_version}`);
    if (data.required_plugins.length === 1)
        infos.push(`Plugin requis : ${data.required_plugins.name}`);
    else if (data.required_plugins.length > 1) {
        const pl = [];
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
function sendEmbed(message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const embed = new discord_js_1.RichEmbed()
            .setColor(config_json_1.default.bot.color)
            .setAuthor(`Informations sur "${data.title}"`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
            .setFooter(`Executé par ${message.author.username} | Données fournies par https://skripthub.net`)
            .addField(conf.embed.patternTitle, conf.embed.patternDesc.replace('%s', `${data.syntax_pattern}`) || conf.embed.noPattern, false)
            .addField(conf.embed.descriptionTitle, data.description || conf.embed.noDescription, false);
        if (data.example) {
            let ex = `${conf.embed.exampleDesc.replace('%s', data.example.example_code)}\n`;
            if (data.example.example_author)
                ex += `Auteur : ${data.example.example_author}\n`;
            if (data.example.score)
                ex += `Appréciation : ${computeScore(data.example.score)}\n`;
            if (data.example.offical_example === true)
                ex += 'Exemple officiel.';
            embed.addField(conf.embed.exampleTitle, ex, false);
        }
        const infos = getInfos(data);
        if (infos.length !== 0)
            embed.addField(conf.embed.infos, infos, false);
        message.channel.send(embed);
    });
}
class SyntaxInfo extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Syntaxe';
        this.description = conf.description;
        this.examples = ['syntax-info join', 's-info tablist', 'sinfo tablist -addon:skrayfall', 'sinfo -id:2000', 'sinfo join -type:event'];
        this.regex = /s(?:yntaxe?)?-?infos?/gimu;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            if (args.length < 1) {
                Messages_1.discordError(conf.invalidCmd, message);
            }
            else {
                const syntaxes = yield main_1.SkriptHubSyntaxes;
                let msg = yield message.channel.send("Je vais chercher ça...");
                let arg = args.join(' ').toUpperCase();
                let addon, type, id;
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
                        if (Number.isNaN(id))
                            id = undefined;
                        arg = arg.replace(new RegExp(/\s?-i(?:d)?:\w+\s?/, 'gimu'), '');
                    }
                }
                let matchingSyntaxes = syntaxes.filter(elt => elt.title.toUpperCase().includes(arg)) ||
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
                    yield msg.delete();
                    return Messages_1.discordError(conf.syntaxDoesntExist, message);
                }
                else if (matchingSyntaxes.length === 1) {
                    msg.delete();
                    return sendEmbed(message, matchingSyntaxes[0]);
                }
                else {
                    yield msg.edit(`${matchingSyntaxes.length} élements trouvés pour la recherche \`${arg}\`. Quelle syntaxe vous interesse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
                    for (let i = 0; i < matchingSyntaxes.length; i++) {
                        msg = (yield msg.edit(`${msg.content}\n${reactionsNumbers[i]} \"${matchingSyntaxes[i].title}\" (${matchingSyntaxes[i].addon})`));
                        yield msg.react(reactionsNumbers[i]);
                    }
                    yield msg.react('❌');
                    const collectorNumbers = msg
                        .createReactionCollector((reaction, user) => !user.bot &&
                        user.id === message.author.id &&
                        reactionsNumbers.includes(reaction.emoji.name)).once("collect", reaction => {
                        msg.delete();
                        sendEmbed(message, matchingSyntaxes[reactionsNumbers.indexOf(reaction.emoji.name)]);
                        collectorNumbers.stop();
                    });
                    const collectorStop = msg
                        .createReactionCollector((reaction, user) => !user.bot &&
                        user.id === message.author.id &&
                        reaction.emoji.name === '❌').once("collect", () => {
                        message.delete();
                        msg.delete();
                        collectorNumbers.stop();
                        collectorStop.stop();
                    });
                }
            }
        });
    }
}
;
exports.default = SyntaxInfo;
