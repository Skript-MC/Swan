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
const roleName = config_json_1.default.miscellaneous.notifRoleName;
class AddNotifRole extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Ajout role notification';
        this.description = config_json_1.default.messages.commands.addNotifRole.description;
        this.examples = ['add-notif-role', 'toggle-notif-role'];
        this.regex = /(?:add|give|ask|toggle)-?notif(?:ication)?-?role/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            message.delete();
            let role = message.guild.roles.find(r => r.name === roleName), targetUser = yield message.guild.fetchMember(message.author);
            if (!role) {
                try {
                    role = yield message.guild.createRole({
                        permissions: [],
                        name: roleName,
                        mentionable: false
                    });
                }
                catch (err) {
                    console.error(`Error while attempting to create the role : ${err}`);
                }
            }
            if (!targetUser.roles.has(role.id)) {
                yield targetUser.addRole(role);
                targetUser.send(`${message.guild} | :white_check_mark: Le rôle *"${config_json_1.default.miscellaneous.notifRoleName}"* vous a été ajouté !`);
            }
            else if (targetUser.roles.has(role.id)) {
                yield targetUser.removeRole(role);
                targetUser.send(`${message.guild} | :white_check_mark: Le rôle *"${config_json_1.default.miscellaneous.notifRoleName}"* vous a été enlevé !`);
            }
        });
    }
}
;
exports.default = AddNotifRole;
