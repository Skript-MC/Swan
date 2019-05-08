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
const https_1 = __importDefault(require("https"));
const config_json_1 = __importDefault(require("../../config/config.json"));
const Command_1 = __importDefault(require("../components/Command"));
const Messages_1 = require("../components/Messages");
const conf = config_json_1.default.messages.commands.addonInfo;
/*
 * Variables :
 * currentData : Objet contenant tous les addons, chaque addons contenant 1 tableau
 * Object.keys(data.data) : Tableau contenant tous les addons (avec case)
 * addons : Tableau contenant tous les addons (sans case)
 * myAddon : String avec le nom de l'addon recherché (avec case)
 * versions : Liste de toutes les versions de l'addon recherché
 */
function sendEmbed(message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let size, unit;
        if (data.data.bytes) {
            size = data.data.bytes / 1000000;
            unit = "Mo";
            if (size < 1) {
                size *= 1000;
                unit = "Ko";
            }
        }
        const embed = new discord_js_1.RichEmbed()
            .setColor(config_json_1.default.bot.color)
            .setAuthor(`Informations sur ${data.data.plugin}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
            .setDescription(data.data.description || "Aucune description disponible.");
        if (data.data.unmaintained)
            embed.addField(conf.embed.unmaintained, conf.embed.unmaintained_desc, true);
        if (data.data.author)
            embed.addField(conf.embed.author, data.data.author, true);
        if (data.data.version)
            embed.addField(conf.embed.version, data.data.version, true);
        if (data.data.download)
            embed.addField(conf.embed.download, `[Téléchargez ici](${data.data.download}) ${size.toFixed(2)} ${unit}`, true);
        if (data.data.sourcecode)
            embed.addField(conf.embed.sourcecode, `[Voir ici](${data.data.sourcecode})`, true);
        if (data.data.depend && data.data.depend.depend)
            embed.addField(conf.embed.depend, data.data.depend.depend, true);
        if (data.data.depend && data.data.depend.softdepend)
            embed.addField(conf.embed.softdepend, data.data.depend.softdepend, true);
        embed.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`);
        message.channel.send(embed);
    });
}
class AddonInfo extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = "Addon";
        this.description = conf.description;
        this.examples = ["addon-info", "addonsinfos"];
        this.regex = /a(?:dd?ons?)?-?infos?/gimu;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            if (args.length < 1) {
                Messages_1.discordError(conf.invalidCmd, message);
            }
            else {
                const addons = [];
                const myAddon = args[0];
                let json = "";
                https_1.default.get(config_json_1.default.miscellaneous.api_addons, resp => {
                    resp.on("data", chunk => (json += chunk));
                    resp.on("end", () => {
                        let data = JSON.parse(json);
                        let versions;
                        for (let addon of Object.keys(data.data)) {
                            addons.push(addon.toLowerCase());
                        }
                        if (addons.includes(myAddon.toLowerCase())) {
                            for (let addon of Object.keys(data.data)) {
                                if (addon.toLowerCase() === myAddon.toLowerCase()) {
                                    versions = data.data[addon];
                                }
                            }
                            let latest = versions[versions.length - 1];
                            latest = latest.replace(" ", "+");
                            https_1.default.get(`${config_json_1.default.miscellaneous.api_addons}${latest}`, resp2 => {
                                json = "";
                                resp2.on("data", chunk => (json += chunk));
                                resp2.on("end", () => {
                                    let data = JSON.parse(json);
                                    sendEmbed(message, data);
                                });
                            }).on("error", err => Messages_1.error(`${err}`));
                        }
                        else {
                            const msg = conf.addonDoesntExist;
                            Messages_1.discordError(msg.replace("%s", `${args[0]}`), message);
                        }
                    });
                }).on("error", err => Messages_1.error(`${err}`));
            }
        });
    }
}
exports.default = AddonInfo;
