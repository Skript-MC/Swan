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
const mutePerms = {
    SEND_MESSAGES: false,
    ADD_REACTIONS: false,
    SEND_TTS_MESSAGES: false,
    SPEAK: false,
    CHANGE_NICKNAME: false
};
function createRole(message, type) {
    return __awaiter(this, void 0, void 0, function* () {
        let role = message.guild.roles.find(r => r.name === config_json_1.default.moderation.muteRole);
        if (!role) {
            try {
                let name;
                switch (type.toUpperCase()) {
                    case "AUTRE":
                        name = `${config_json_1.default.moderation.muteRole} - Aide autre`;
                        break;
                    case "SERVEUR":
                        name = `${config_json_1.default.moderation.muteRole} - Aide serveur`;
                        break;
                    case "SKRIPT":
                        name = `${config_json_1.default.moderation.muteRole} - Aide skript`;
                        break;
                    case "GLOBAL":
                        name = `${config_json_1.default.moderation.muteRole}`;
                        break;
                    default:
                        name = `${config_json_1.default.moderation.muteRole}`;
                }
                role = yield message.guild.createRole({
                    name: name,
                    color: 0x000001,
                    position: config_json_1.default.moderation.muteRolePosition
                });
                if (name.includes('autre')) {
                    let chan = message.guild.channels.find(chan => chan.id === config_json_1.default.moderation.channelIdHelpOther);
                    yield chan.overwritePermissions(role, mutePerms);
                }
                else if (name.includes('serveur')) {
                    let chan = message.guild.channels.find(chan => chan.id === config_json_1.default.moderation.channelIdHelpServer);
                    yield chan.overwritePermissions(role, mutePerms);
                }
                else if (name.includes('skript')) {
                    let chan = message.guild.channels.find(chan => chan.id === config_json_1.default.moderation.channelIdHelpSkript);
                    yield chan.overwritePermissions(role, mutePerms);
                    chan = message.guild.channels.find(chan => chan.id === config_json_1.default.moderation.channelIdHelpSkript2);
                    yield chan.overwritePermissions(role, mutePerms);
                }
                else {
                    message.guild.channels.forEach((channel, id) => __awaiter(this, void 0, void 0, function* () {
                        yield channel.overwritePermissions(role, mutePerms);
                    }));
                }
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
        this.shortDescription = conf.shortDesc;
        this.longDescription = conf.longDesc;
        this.usage = `mute <@mention | ID> <durée> <type> [raison]`;
        this.examples = ['mute'];
        this.channels = ['*'];
        this.regex = /mute/gmui;
        this.permissions = ['Staff'];
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
            if (!victim)
                return messages_1.discordError(conf.missingUserArgument, message);
            if (!args[1])
                return messages_1.discordError(conf.missingTimeArgument, message);
            if (!args[2])
                return messages_1.discordError(conf.missingTypeArgument, message);
            if (args[2].toUpperCase() !== 'SKRIPT' &&
                args[2].toUpperCase() !== 'SERVEUR' &&
                args[2].toUpperCase() !== 'AUTRE' &&
                args[2].toUpperCase() !== 'GLOBAL')
                return messages_1.discordError(conf.invalidTypeArgument, message);
            // if (victim.id === message.author.id) return discordError(conf.unableToSelfMute, message);
            // if (victim.highestRole.position >= message.member.highestRole.position) return discordError(conf.userTooPowerful, message);
            for (let d of Object.keys(durations)) {
                if (args[1].replace(/\d+/g, '') === d) {
                    let multiple = durations[d], duration = "Infinie", end = "";
                    let role = yield createRole(message, args[2]);
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
                        .replace("%r", args.splice(3).join(' ') || "*aucune raison spécifiée*")
                        .replace("%d", duration);
                    messages_1.discordSuccess(success, message);
                    return Log_1.modLog({
                        color: "#ff6b61",
                        member: victim,
                        mod: message.author,
                        action: `Mute (${args[2].toUpperCase() === 'GLOBAL' ? `global` : `aide ${args[2].toLowerCase()}`})`,
                        duration: duration,
                        finish: end,
                        reason: args.splice(3).join(' ') || "Aucune raison spécifiée"
                    }, message.guild);
                }
            }
            messages_1.discordError(conf.wrongDuration, message);
        });
    }
}
;
exports.default = Mute;
