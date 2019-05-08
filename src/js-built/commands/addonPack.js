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
const conf = config_json_1.default.messages.commands.addonPack;
const versions = ['7', '8', '9', '10', '11', '12', '13', '14'];
class AddonPack extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Pack d\'addon';
        this.shortDescription = conf.shortDesc;
        this.longDescription = conf.longDesc;
        this.usage = `addon-pack <version MC>`;
        this.examples = ['addon-pack 1.13.2', 'addon-pack 1.10.2'];
        this.regex = /add?ons?-?pack/gimu;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            if (args.length > 0 && args[0].match(/1\.(7|8|9|10|11|12|13|14)(?:\.\d*)?/gimu)) {
                const arg = args[0].slice(2);
                for (let i = 0; i < versions.length; i++) {
                    if (arg.includes(versions[i])) {
                        message.channel.send(conf.messages[i]);
                        break;
                    }
                }
            }
            else {
                Messages_1.discordError(config_json_1.default.messages.commands.addonPack.invalidCmd, message);
            }
        });
    }
}
;
exports.default = AddonPack;
