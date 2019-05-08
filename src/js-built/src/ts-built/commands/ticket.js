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
const conf = config_json_1.default.messages.commands.ticket;
const questions = {
    "Quel est votre type de problème ?": {
        'global': [],
        'site': [],
        'demande d\'aide skript': [
            'Quelle est votre version de serveur (Faites `/version` dans votre console de serveur) ?',
            'Quelle est votre version de Skript (Faites `/version skript` dans votre console de serveur) ?',
            'Quels sont vos addons ? (Faites `/plugins` dans votre console de serveur)',
            'Quels est votre code ? (Le code comportant un(e) problème/erreur)',
            'Quel est précisemment votre problème ? (Donner toutes les erreurs que vous avez sous lien <https://hastebin.com>)'
        ],
        'demande d\'aide serveur': [],
        'demande d\'aide java': [],
        'discord': []
    },
    "Merci d'avoir utiliser notre service de tickets. N'hésitez pas à dire ce que vous en avez pensé.": {
        'très mauvais': ['Merci de nous avoir partagé votre avis!'],
        'mauvais': ['Merci de nous avoir partagé votre avis!'],
        'passable': ['Merci de nous avoir partagé votre avis!'],
        'bien': ['Merci de nous avoir partagé votre avis!'],
        'très bien': ['Merci de nous avoir partagé votre avis!'],
        'excellent': ['Merci de nous avoir partagé votre avis!']
    }
};
class Ticket extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Ticket';
        this.shortDescription = conf.shortDesc;
        this.longDescription = conf.longDesc;
        this.regex = /ticket/gmui;
        this.usage = 'ticket';
        this.examples = ['ticket', 'ticket Aled'];
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            for (let key of Object.keys(questions)) {
                const question = yield message.reply(`${key} (${Object.keys(questions[key]).join(', ')})`);
                const answers = [];
                let answer = yield message.channel.awaitMessages(response => !response.author.bot &&
                    response.author.id === message.author.id &&
                    Object.keys(questions[key]).some(possibility => possibility.toLowerCase() === response.content.toLowerCase()), { maxMatches: 1, time: 120000, errors: ['time'] }).then(collected => {
                    return collected.first();
                }).catch(err => console.error(err));
                answer.delete();
                for (let type of Object.keys(questions[key])) {
                    if (answer.content === type) {
                        console.log('yeah!');
                        for (let i = 0; i < Object.keys(questions[key][type]).length; i++) {
                            //question.edit(questions[key][type]);
                            yield answer.channel.awaitMessages(response => !response.author.bot &&
                                response.author.id === answer.author.id, { maxMatches: 1, time: 120000, errors: ['time'] })
                                .then(collected => {
                                console.log("collecté");
                                // return;
                            }).catch(err => console.error(err));
                            // const question = Object.keys(questions[key])[type][i];
                            // answers[i] = await message.reply(question);
                        }
                        break;
                    }
                }
            }
        });
    }
}
exports.default = Ticket;
