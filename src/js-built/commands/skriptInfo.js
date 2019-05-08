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
const Command_1 = __importDefault(require("../components/Command"));
const config_json_1 = __importDefault(require("../../config/config.json"));
const https_1 = __importDefault(require("https"));
const messages_1 = require("../components/messages");
const conf = config_json_1.default.messages.commands.skriptInfo;
function sendEmbed(message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let size, unit;
        if (data.data.bytes)
            size = data.data.bytes / 1000000;
        const embed = new discord_js_1.RichEmbed()
            .setColor(config_json_1.default.bot.color)
            .setAuthor(`Informations sur Skript`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128");
        if (data.data.author)
            embed.addField(conf.embed.author, data.data.author, true);
        if (data.data.download)
            embed.addField(conf.embed.download, `[Téléchargez ici](${data.data.download}) ${size.toFixed(2)} Mo`, true);
        if (data.data.source)
            embed.addField(conf.embed.sourcecode, `[Voir ici](${data.data.source})`, true);
        if (data.data.version)
            embed.addField(conf.embed.version, `${data.data.version} (1.9 - 1.13)`, true);
        embed.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`);
        /*const embed2: RichEmbed = new RichEmbed()
            .setColor(config.bot.color)
            .setAuthor(conf.embed.verInfo, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
            .setDescription(conf.embed.verInfo_desc)
            .setFooter(`Executé par ${message.author.username}`);
        */
        message.channel.send(embed);
        messages_1.discordInfo(conf.embed.verInfo_desc, message);
    });
}
class SkriptInfo extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Skript';
        this.shortDescription = config_json_1.default.messages.commands.addonInfo.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.addonInfo.longDesc;
        this.usage = `skript-info`;
        this.examples = ['skriptInfo'];
        this.regex = /s(?:k|c)(?:ript?)?-?infos?/gimu;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            https_1.default.get(config_json_1.default.miscellaneous.api_skript, resp => {
                let json = "";
                resp.on("data", chunk => (json += chunk));
                resp.on("end", () => {
                    let data = JSON.parse(json);
                    let latest = data.data[data.data.length - 1];
                    https_1.default.get(`${config_json_1.default.miscellaneous.api_skript}${latest}`, resp => {
                        json = "";
                        resp.on("data", chunk => (json += chunk));
                        resp.on("end", () => {
                            data = JSON.parse(json);
                            sendEmbed(message, data);
                        });
                    });
                });
            });
        });
    }
}
;
exports.default = SkriptInfo;
