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
const package_json_1 = __importDefault(require("../../package.json"));
const main_1 = require("../main");
const main_2 = require("../main");
class Statistics extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Statistiques';
        this.shortDescription = config_json_1.default.messages.commands.statistics.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.statistics.longDesc;
        this.usage = `stats`;
        this.examples = ['stats'];
        this.regex = /stat(?:isti(?:c|que))?s?/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            const clnt = yield main_1.client;
            let totalSeconds = (clnt.uptime / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const allCmds = yield main_2.commands;
            const cmds = allCmds.length;
            const onlineUsers = message.guild.members.filter(m => (m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd') && !m.user.bot).size;
            const totalUsers = message.guild.members.filter(m => !m.user.bot).size;
            const offlineUsers = totalUsers - onlineUsers;
            const totalBots = message.guild.members.filter(m => m.user.bot).size;
            const total = totalBots + totalUsers;
            const embed = new discord_js_1.RichEmbed()
                .setColor(config_json_1.default.bot.color)
                .setAuthor(`Statistiques sur le bot`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
                .addField('Préfix', config_json_1.default.bot.prefix, true)
                .addField('Version', package_json_1.default.version, true)
                .addField('Temps de fonctionnement', `${days}j, ${hours}h, ${minutes}min et ${Math.round(seconds)}s`, true)
                .addField('Commandes', cmds, true)
                .addField('Répartition des membres', `${onlineUsers} en ligne / ${offlineUsers} hors ligne / ${totalBots} bots`, true)
                .addField('Total', `${total} membres`, true)
                // .addField('Développeurs', `${pkg.authors.join(', ')}`, true)
                .setFooter(`Executé par ${message.author.username}`)
                .setTimestamp();
            message.channel.send(embed);
        });
    }
}
;
exports.default = Statistics;
