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
class Ping extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Ping';
        this.shortDescription = config_json_1.default.messages.commands.ping.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.ping.longDesc;
        this.usage = `ping`;
        this.examples = ['ping'];
        this.regex = /(?:ping|ms)/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            const msg = yield message.channel.send("Pong !");
            msg.edit(`Pong ! La latence du bot est de ${msg.createdTimestamp - message.createdTimestamp}ms.`);
        });
    }
}
;
exports.default = Ping;
