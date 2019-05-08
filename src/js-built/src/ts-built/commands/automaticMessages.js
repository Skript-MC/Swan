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
const conf = config_json_1.default.messages.commands.auto.commands;
class AutomaticMessages extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Messages automatiques';
        this.shortDescription = config_json_1.default.messages.commands.auto.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.auto.longDesc;
        this.usage = `auto <message>`;
        this.examples = ['auto asktoask'];
        this.channels = ['*'];
        this.regex = /auto(?:mati(?:que|c))?-?(?:messages?)?/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            if (args[0] === 'asktoask')
                return message.channel.send(conf.asktoask.content);
            else if (args[0] === 'helptemplate')
                return message.channel.send(conf.helptemplate.content);
            else if (args[0] === 'internal' || args[0] === 'internalerror')
                return message.channel.send(conf.internalerror.content);
            else if (args[0] === 'deprecated' || args[0] === 'oldaddon')
                return message.channel.send(conf.deprecated.content);
            // else if (args[0] === 'opinion')
            // 	return message.channel.send({ files: [{ attachment: 'https://cdn.discordapp.com/attachments/460036535845388301/573493651112591360/img-22223753dff.jpg', name: 'opinion.jpg' }] });
            else if (args[0] === 'gui')
                return message.channel.send(conf.gui.shortContent);
            else if (args[0] === 'gui-pv') {
                yield message.member.send(conf.gui.longContent1);
                return message.member.send(conf.gui.longContent2);
            }
            else if (args[0] === 'everyloop')
                return message.channel.send(conf.everyloop.content);
            else if (args[0] === 'longcode' || args[0] === 'code')
                return message.channel.send(conf.longcode.content);
            else if (args[0] === 'ver' || args[0] === 'version')
                return message.channel.send(conf.version.content);
            else if (args[0] === 'list' || args[0] === 'liste')
                return message.channel.send(conf.list.content);
            else
                return message.channel.send(conf.invalidMessage);
        });
    }
}
;
exports.default = AutomaticMessages;
