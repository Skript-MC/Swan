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
const Messages_1 = require("./Messages");
/**
 * Fonction qui envoie un log des actions de modération
 * @param {Object} info - Informations sur l'action de modération:
 * - color: {string} couleur de l'embed
 * - user: {GuildMember} utilisateur qui a été sanctionné
 * - mod: {User} modérateur qui a sanctionné
 * - action: {string} sanction appliquée
 * - duration: {string} durée de la sanction
 * - finish: {string} fin de la sanciton
 * - reason: {string} raison de la sanction
 * - privateChannel: {GuildChannel} (facultatif) Channel privé créé entre le staff et l'utilisateur
 * @param {Guild} guild - Guild dans laquelle la sanction a été appliquée
 * @returns {Promise<void>}
 * @async
 */
function modLog(info, guild) {
    return __awaiter(this, void 0, void 0, function* () {
        const embed = new discord_js_1.RichEmbed()
            .setColor(info.color)
            .setTitle('Nouveau cas :')
            .addField(":bust_in_silhouette: Utilisateur", `${info.member}\n(${info.member.id})`, true)
            .addField(":cop: Modérateur", `${info.mod}\n(${info.mod.id})`, true)
            .addField(":tools: Action", `${info.action}`, true);
        if (info.finish !== "")
            embed.addField(":stopwatch: Durée", `${info.duration}\nExpire ${info.finish}`, true);
        else
            embed.addField(":stopwatch: Durée", `${info.duration}`, true);
        embed.addField(":scroll: Raison", `${info.reason}`, true);
        if (info.privateChannel)
            embed.addField(":speech_left: Channel privé", `${info.privateChannel}`, true);
        embed.setFooter("Éxecuté")
            .setTimestamp();
        let chan = guild.channels.find(c => c.name === config_json_1.default.moderation.log.channelName && c.type === 'text');
        if (!chan) {
            try {
                chan = yield guild.createChannel(config_json_1.default.moderation.log.channelName, 'text');
                chan.setParent(config_json_1.default.moderation.log.categoryID);
                chan.overwritePermissions(guild.roles.find(r => r.name === '@everyone'), {
                    VIEW_CHANNEL: false
                });
                chan.overwritePermissions(guild.roles.find(r => r.name === 'Staff'), {
                    VIEW_CHANNEL: true,
                    ADD_REACTIONS: false,
                    SEND_MESSAGES: false,
                    SEND_TTS_MESSAGES: false,
                    MANAGE_MESSAGES: false
                });
            }
            catch (err) {
                Messages_1.error(`Error while attempting to create the channel : ${err}`);
            }
        }
        chan.send(embed);
    });
}
exports.modLog = modLog;
