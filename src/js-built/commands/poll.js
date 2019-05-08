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
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../components/Command"));
const config_json_1 = __importDefault(require("../../config/config.json"));
const Messages_1 = require("../components/Messages");
const utils_1 = require("../utils");
const durations = {
    's(ec(ond)?)?e?': 1,
    'min(ute)?': 60,
    'h(our|eure?)?': 3600,
    '(d(ay)?)|(j(our)?)': 86400
};
const reactions = ['✅', '❌', 'ℹ', '🛑'];
function endPoll(msg, embed, collectors, results) {
    embed.setColor(config_json_1.default.messages.success.color)
        .setDescription('Ce vote est finit !')
        .addField('Résultats :', `:white_check_mark: : ${results.yes} oui (${100 * results.yes / (results.yes + results.no) || 0}%)\n:x: : ${results.no} non (${100 * results.no / (results.yes + results.no) || 0}%)\n:bust_in_silhouette: : ${(results.yes + results.no)} votant(s).`);
    collectors.collector.stop();
    collectors.collectorInfo.stop();
    collectors.collectorStop.stop();
    msg.clearReactions();
    msg.edit(embed);
}
class Poll extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Sondage';
        this.shortDescription = config_json_1.default.messages.commands.poll.shortDesc;
        this.longDescription = config_json_1.default.messages.commands.poll.longDesc;
        this.usage = `poll <durée> <titre_sans_espaces> [description avec espaces]`;
        this.examples = ['poll 10min Mon_titre Ma description'];
        this.channels = ['*']; // Juste accueil, salon pleureuse, bot, salon boss. A modifier avec les bons ID.
        this.regex = /poll|vote|sond(?:age)?/gmui;
        this.permissions = this.permissions.concat(['Staff', 'Membre Actif']);
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            if (args.length < 2)
                return Messages_1.discordError(config_json_1.default.messages.commands.poll.invalidCmd, message);
            for (let duration of Object.keys(durations)) {
                if (args[0].match(new RegExp(duration, 'gmui'))) {
                    let wait, finished;
                    let no = 0, yes = 0;
                    let mult = durations[duration], time = args[0].split(/[a-zA-Z]+/gmui)[0];
                    wait = mult * time * 1000;
                    if (wait > config_json_1.default.miscellaneous.maxPollDuration)
                        return Messages_1.discordError((config_json_1.default.messages.commands.poll.tooLong).replace("%s", `${config_json_1.default.miscellaneous.maxPollDuration}`), message);
                    //wait = durations[duration] * args[0].split(/[a-zA-Z]+/gmui)[0] * 1000;
                    let date = new Date(Date.now() + wait);
                    let end;
                    end = utils_1.formatDate(date);
                    let embed = new discord_js_1.RichEmbed()
                        .setAuthor(`Vote de ${message.author.username}`, message.author.avatarURL)
                        .setTitle(args[1].replace(/_/gmui, ' '))
                        .setDescription(`${args.splice(2, args.length).join(' ')}\n\nCe vote dure : ${args[0]} (Finit ${end})`)
                        .setFooter("Executé par " + message.author.username);
                    let msg = yield message.channel.send(embed);
                    for (let r of reactions)
                        yield msg.react(r);
                    embed.setColor(config_json_1.default.bot.color);
                    yield msg.edit(embed);
                    const collector = msg
                        .createReactionCollector((reaction, user) => !user.bot &&
                        (reaction.emoji.name === '✅' ||
                            reaction.emoji.name === '❌'))
                        .once("collect", reaction => {
                        if (reaction.emoji.name === '❌')
                            no += 1;
                        else if (reaction.emoji.name === '✅')
                            yes += 1;
                    });
                    const collectorInfo = msg
                        .createReactionCollector((reaction, user) => !user.bot &&
                        reaction.emoji.name === 'ℹ' &&
                        user.id === message.author.id)
                        .once("collect", () => {
                        Messages_1.discordInfo(config_json_1.default.messages.commands.poll.pollInfos, message);
                    });
                    const collectorStop = msg
                        .createReactionCollector((reaction, user) => !user.bot &&
                        reaction.emoji.name === '🛑' &&
                        user.id === message.author.id)
                        .once("collect", () => {
                        const results = { yes, no }, collectors = { collector, collectorInfo, collectorStop };
                        endPoll(msg, embed, collectors, results);
                        finished = true;
                    });
                    setTimeout(() => {
                        if (finished)
                            return;
                        const results = { yes, no }, collectors = { collector, collectorInfo, collectorStop };
                        return endPoll(msg, embed, collectors, results);
                    }, wait);
                    return;
                }
            }
            Messages_1.discordError(config_json_1.default.messages.commands.poll.invalidCmd, message);
        });
    }
}
;
exports.default = Poll;
