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
const messages_1 = require("../components/messages");
const main_1 = require("../main");
class Purge extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Purge';
        this.description = config_json_1.default.messages.commands.purge.description;
        this.examples = ['purge @utilisateur 20', 'purge 50'];
        this.regex = /purge/gmui;
        this.channels = ['*'];
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            const user = message.mentions.users.first();
            const amount = !!parseInt(args[0]) ? parseInt(args[0]) + 1 : parseInt(args[1]) + 1;
            if (!amount)
                return messages_1.discordError(config_json_1.default.messages.commands.purge.missingNumberArgument, message);
            if (!amount && !user)
                return messages_1.discordError(config_json_1.default.messages.commands.purge.wrongUsage, message);
            message.channel.fetchMessages({
                limit: amount,
            }).then((messages) => {
                if (user) {
                    const cli = main_1.client;
                    const filterBy = user ? user.id : cli.user.id;
                    messages = messages.filter((m) => m.author.id === filterBy).array().slice(0, amount);
                }
                message.channel.bulkDelete(messages).catch(err => console.error(err));
            });
        });
    }
}
;
exports.default = Purge;
