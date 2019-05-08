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
const affirmative = ['Oui.', 'Oui !', 'D\'après moi, oui !', 'Je le pense', 'C\'est une chose sûre !', 'C\'est certain.', 'Sans aucun doutes', 'Il me semble...', 'Pourquoi demander ? La réponse parait évidente ! Oui !', 'ET C\'EST UN OUI !', 'Oui ! NAN J\'AI PERDU :sob: Je suis vraiment nul au ni-oui ni-non :weary: ', 'Affirmatif, chef.', 'Positif.'];
const negative = ['Non.', 'MDR NON', 'C\'est un non.', 'Mes sources me confirment que non.', 'C\'est mieux que tu ne sois pas au courant...', 'Bien sur que non !', 'Je ne suis pas sur de comprendre... Dans le doute je vais dire non.', 'Question très compliquée... Mais je dirai non.', 'Ou... Non ! C\'est Non !', 'Bien sur que non...', 'Négatif', 'Je répondrai par la négation. Rah chui trop fort à ni-oui ni-non ! Tu me battras jamais :wink:', 'Sûrement pas.'];
class EightBall extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = '8Ball';
        this.shortDescription = config_json_1.default.messages.commands.eightBall.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.eightBall.longDesc;
        this.usage = `8ball <question>`;
        this.examples = ['8ball suis-je le plus beau ?'];
        this.regex = /(?:8|eight)-?ball/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            let answer;
            if (Math.random() < 0.5)
                answer = affirmative[Math.floor(Math.random() * affirmative.length)];
            else
                answer = negative[Math.floor(Math.random() * negative.length)];
            message.channel.send(answer);
        });
    }
}
;
exports.default = EightBall;
