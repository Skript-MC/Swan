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
const Messages_1 = require("../components/Messages");
class TagRole extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Tag Role';
        this.shortDescription = config_json_1.default.messages.commands.tagRole.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.tagRole.longDesc;
        this.usage = `tag-role`;
        this.examples = ['tagrole Notifications Évènements'];
        this.regex = /(?:tag|mention|notif)-?role/gmui;
        this.permissions = ['Staff'];
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            if (args.length === 0) {
                return Messages_1.discordError(config_json_1.default.messages.commands.tagRole.invalidCmd, message);
            }
            else {
                message.delete();
                let role = message.guild.roles.find(r => r.name.toUpperCase() === args.join(' ').toUpperCase());
                if (role) {
                    if (!role.mentionable) {
                        try {
                            role.setMentionable(true);
                        }
                        catch (err) {
                            console.error(`An error occured while attempting to set the mentionable state of role ${role} to true. Error : ${err}`);
                        }
                    }
                    yield message.channel.send(`${role}`);
                    if (role.mentionable) {
                        try {
                            role.setMentionable(false);
                        }
                        catch (err) {
                            console.error(`An error occured while attempting to set the mentionable state of role ${role} to false. Error : ${err}`);
                        }
                    }
                }
                else {
                    return Messages_1.discordError(config_json_1.default.messages.commands.tagRole.invalidRole.replace('%s', args.join(' ')), message);
                }
            }
        });
    }
}
;
exports.default = TagRole;
