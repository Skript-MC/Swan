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
/* eslint-disable sort-keys */
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../../config/config.json"));
const Command_1 = __importDefault(require("../components/Command"));
const maxPage = 5;
const reactionsNumbers = ['🇽', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣'];
const reactionsPage = ['⏮', '◀', '🇽', '▶', '⏭'];
const conf = config_json_1.default.messages.commands.links;
class Links extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = "Liens importants";
        this.description = conf.description;
        this.examples = ['lien', 'liens', 'links'];
        this.regex = /(?:link|lien)s?/gmui;
        this.execute = (message, args, page) => __awaiter(this, void 0, void 0, function* () {
            page = Number.isInteger(page) ? page : 0;
            const embed = new discord_js_1.RichEmbed()
                .setColor(config_json_1.default.bot.color)
                .setAuthor(`Liens utiles (${page + 1}/${maxPage + 1})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
                .setDescription('‌‌ ') // Caractère invisible (‌‌ )
                .setFooter("Executé par " + message.author.username);
            switch (page) {
                case 1:
                    embed.addField(conf.embed.docSkSkMc_title, conf.embed.docSkSkMc_desc, true)
                        .addField(conf.embed.docSkOffi_title, conf.embed.docSkOffi_desc, true);
                    break;
                case 2:
                    embed.addField(conf.embed.docAddSkMc_title, conf.embed.docAddSkMc_desc, true)
                        .addField(conf.embed.docAdd_title, conf.embed.docAdd_desc, true);
                    break;
                case 3:
                    embed.addField(conf.embed.dlSk_title, conf.embed.dlSk_desc, true)
                        .addField(conf.embed.dlAdd_title, conf.embed.dlAdd_desc, true);
                    break;
                case 4:
                    embed.addField(conf.embed.discSkMc_title, conf.embed.discSkMc_desc, true)
                        .addField(conf.embed.discSkCh_title, conf.embed.discSkCh_desc, true);
                    break;
                case 5:
                    embed.addField(conf.embed.forumSkMc_title, conf.embed.forumSkMc_desc, true)
                        .addField(conf.embed.gitSk_title, conf.embed.gitSk_desc, true);
                    break;
                default:
                    embed.setDescription(conf.embed.summary);
                    break;
            }
            let msgLinks = yield message.channel.send(embed);
            if (page === 0) {
                for (let r of reactionsNumbers)
                    yield msgLinks.react(r);
                const collector = msgLinks
                    .createReactionCollector((reaction, user) => user.id === message.author.id &&
                    reactionsNumbers.includes(reaction.emoji.name))
                    .once("collect", reaction => {
                    msgLinks.delete();
                    if (reaction.emoji.name === '🇽')
                        message.delete();
                    else
                        this.execute(message, args, reactionsNumbers.indexOf(reaction.emoji.name));
                    collector.stop();
                });
            }
            else {
                for (let r of reactionsPage)
                    yield msgLinks.react(r);
                this.reactionCollector(message, args, msgLinks, page);
            }
        });
        // Fonction appelée lorsque l'on réagis avec une réaction de type reactionsPage (donc quand on est pas sur le sommaire)
        this.reactionCollector = (message, args, msgLinks, page) => __awaiter(this, void 0, void 0, function* () {
            const collector = msgLinks
                .createReactionCollector((reaction, user) => !user.bot &&
                user.id === message.author.id &&
                reactionsPage.includes(reaction.emoji.name))
                .once("collect", reaction => {
                msgLinks.delete();
                if (reaction.emoji.name === '⏮') {
                    this.execute(message, args, 0);
                }
                else if (reaction.emoji.name === '◀') {
                    const prevPage = page <= 0 ? maxPage : page - 1;
                    this.execute(message, args, prevPage);
                }
                else if (reaction.emoji.name === '🇽') {
                    message.delete();
                }
                else if (reaction.emoji.name === '▶') {
                    const nextPage = page + 1 > maxPage ? 0 : page + 1;
                    this.execute(message, args, nextPage);
                }
                else if (reaction.emoji.name === '⏭') {
                    this.execute(message, args, maxPage);
                }
                collector.stop();
            });
        });
    }
}
;
exports.default = Links;
