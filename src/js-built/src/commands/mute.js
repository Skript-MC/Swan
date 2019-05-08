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
const Command_1 = __importDefault(require("../components/Command"));
const config_json_1 = __importDefault(require("../../config/config.json"));
const Log_1 = require("../components/Log");
const messages_1 = require("../components/messages");
const utils_1 = require("../utils");
const conf = config_json_1.default.messages.commands.mute;
const durations = {
    's': 1,
    'min': 60,
    'h': 3600,
    'd': 86400,
    'j': 86400,
    'mo': 2629800,
    'def': -1
};
function createRole(message) {
    return __awaiter(this, void 0, void 0, function* () {
        let role = message.guild.roles.find(r => r.name === config_json_1.default.moderation.muteRole);
        if (!role) {
            try {
                role = yield message.guild.createRole({
                    name: config_json_1.default.moderation.muteRole,
                    color: "#000000"
                });
                message.guild.channels.forEach((channel, id) => __awaiter(this, void 0, void 0, function* () {
                    yield channel.overwritePermissions(role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        SEND_TTS_MESSAGES: false,
                        SPEAK: false,
                        CHANGE_NICKNAME: false
                    });
                }));
            }
            catch (err) {
                messages_1.error(`Error while attempting to create the role : ${err}`);
            }
        }
        return role;
    });
}
class Mute extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Mute';
        this.description = conf.description;
        this.examples = ['mute'];
        this.regex = /mute/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
            if (!victim)
                return messages_1.discordError(conf.missingUserArgument, message);
            if (!args[1])
                return messages_1.discordError(conf.missingTimeArgument, message);
            //if (victim.id === message.author.id) return discordError(conf.unableToSelfMute, message);
            //if (victim.highestRole.position >= message.member.highestRole.position) return discordError(conf.userTooPowerful, message);
            for (let d of Object.keys(durations)) {
                if (args[1].replace(/\d+/g, '') === d) {
                    let multiple = durations[d], duration = "Infinie", end = "";
                    let role = yield createRole(message);
                    if (victim.roles.has(role.id))
                        return messages_1.discordError(conf.alreadyMuted.replace("%u", victim), message);
                    yield victim.addRole(role);
                    if (multiple !== -1) { // Si ce n'est pas un ban def
                        let time = args[1].split(/[a-zA-Z]+/gmui)[0];
                        let wait = multiple * time * 1000; // Temps (en millisecondes) de la sanction
                        let date = new Date(Date.now() + wait); // Date (en millisecondes) à laquelle la sanction expire
                        duration = args[1];
                        end = utils_1.formatDate(date);
                    }
                    const success = conf.successfullyMuted
                        .replace("%u", `${victim}`)
                        .replace("%r", args.splice(2).join(" ") || "*aucune raison spécifiée*")
                        .replace("%d", duration);
                    messages_1.discordSuccess(success, message);
                    return Log_1.modLog({
                        color: "#ff6b61",
                        member: victim,
                        mod: message.author,
                        action: "Mute",
                        duration: duration,
                        finish: end,
                        reason: args.splice(2).join(" ") || "Aucune raison spécifiée"
                    }, message.guild);
                }
            }
            messages_1.discordError(conf.wrongDuration, message);
        });
    }
}
;
exports.default = Mute;
