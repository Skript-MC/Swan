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
const conf = config_json_1.default.messages.commands.findmyerror;
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
class FindMyError extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Trouve Mon Erreur';
        this.shortDescription = conf.shortDesc;
        this.longDescription = conf.longDesc;
        this.usage = `trouvemonerreur`;
        this.examples = ['findmyerror', 'trouvemonerreur'];
        this.regex = /(?:findmyerr?or|trouvemonerr?eure?)/gmui;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            let msg = yield message.channel.send(conf.hub);
            for (let reaction of reactionsNumbers)
                yield msg.react(reaction);
            yield msg.react('❌');
            const collector = msg
                .createReactionCollector((reaction, user) => !user.bot &&
                user.id === message.author.id &&
                (reactionsNumbers.includes(reaction.emoji.name) || reaction.emoji.name === '❌'))
                .once('collect', (reaction) => __awaiter(this, void 0, void 0, function* () {
                let edit;
                switch (reaction.emoji.name) {
                    case '1⃣':
                        edit = `__Indentation error :__\n\n${conf.error.indentation}`;
                        break;
                    case '2⃣':
                        edit = `__Can't understand this XX :__\n\n${conf.error.cantunderstand}`;
                        break;
                    case '3⃣':
                        edit = `__Empty configuration section :__\n\n${conf.error.emptysection}`;
                        break;
                    case '4⃣':
                        edit = `__Invalid use of quotes :__\n\n${conf.error.invalidquotes}`;
                        break;
                    case '5⃣':
                        edit = `__There's no loop that match XX :__\n\n${conf.error.noloopmatch}`;
                        break;
                    case '6⃣':
                        edit = `__"else" has to be place just after an "if" :__\n\n${conf.error.elseafterif}`;
                        break;
                    case '7⃣':
                        edit = `__Can't compare XX with XX :__\n\n${conf.error.cantcompare}`;
                        break;
                    case '8⃣':
                        edit = `__XX is not a valid item data :__\n\n${conf.error.notvaliditemdata}`;
                        break;
                    case '9⃣':
                        edit = `__XX can't be added to XX :__\n\n${conf.error.cantbeadded}`;
                        break;
                    case '🔟':
                        edit = `__Autres erreurs :__\n\n${conf.error.other}`;
                        break;
                    case '❌':
                        message.delete();
                        msg.delete();
                        collector.stop();
                        return;
                }
                yield msg.edit(edit);
                yield msg.clearReactions();
                yield msg.react('↩');
                yield msg.react('❌');
                const collector2 = msg
                    .createReactionCollector((reaction, user) => !user.bot &&
                    user.id === message.author.id &&
                    (reaction.emoji.name === '↩' || reaction.emoji.name === '❌'))
                    .once('collect', reaction => {
                    msg.delete();
                    collector.stop();
                    collector2.stop();
                    if (reaction.emoji.name === '↩')
                        this.execute(message, args);
                    else if (reaction.emoji.name === '❌')
                        message.delete();
                });
            }));
        });
    }
}
;
exports.default = FindMyError;
