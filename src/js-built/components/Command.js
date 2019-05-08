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
const config_json_1 = __importDefault(require("../../config/config.json"));
class Command {
    constructor() {
        /**
         * @property {string} name - Nom de la commande
         * @property {string} description - Description de la commande
         * @property {RegExp[]} regex - Patterns regex de la commande
         * @property {string[]} examples - Exemples d'utilisation de la commande
         * @property {string[]} [permissions=config.bot.default_permissions] - Rôles requis par l'utilisateur pour
         * executer la commande
         * @property {string[]} [channels] - ID des channels dans lesquels la commande est utilisable
         */
        this.permissions = config_json_1.default.bot.default_permissions;
        this.channels = config_json_1.default.bot.default_channels;
        this.setup = () => { };
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = Command;
