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
const mathjs_1 = __importDefault(require("mathjs"));
const Messages_1 = require("../components/Messages");
const parser = mathjs_1.default.parser();
class Math extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Mathématiques';
        this.shortDescription = config_json_1.default.messages.commands.math.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.math.longDesc;
        this.usage = `math <expression mathématique de skript>`;
        this.examples = ['math `sqrt(12) + 18 - abs(-13)`'];
        this.regex = /(?:maths?|eval)/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            let expr = args.join(' ');
            expr
                .replace(/abs\(/gimu, 'Math.abs(')
                .replace(/acos\(/gimu, 'Math.acos(')
                .replace(/asin\(/gimu, 'Math.asin(')
                .replace(/atan\(/gimu, 'Math.atan(')
                .replace(/atan2\(/gimu, 'Math.atan2(')
                .replace(/ceil\(/gimu, 'Math.ceil(')
                .replace(/cos\(/gimu, 'Math.cos(')
                .replace(/exp\(/gimu, 'Math.ceil(')
                .replace(/floor\(/gimu, 'Math.floor(')
                .replace(/ln\(/gimu, 'Math.log')
                .replace(/log\(/gimu, 'Math.log10(')
                .replace(/round\(/gimu, 'Math.round(')
                .replace(/sin\(/gimu, 'Math.sin(')
                .replace(/sqrt\(/gimu, 'Math.sqrt(')
                .replace(/tan\(/gimu, 'Math.tan(');
            expr.replace(/mod\(\s*(\d+)\s*,\s*(\d+)\s*\)/gimu, '$1 % $2');
            try {
                expr = parser.eval(expr);
            }
            catch (err) {
                return Messages_1.discordError("Il semblerai qu'il y ai un problème dans ton expression...", message);
            }
            message.reply(`\`${expr}\` = \`${expr}\``);
        });
    }
}
;
exports.default = Math;
