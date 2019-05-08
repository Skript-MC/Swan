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
const config_json_1 = __importDefault(require("../../config/config.json"));
const Command_1 = __importDefault(require("../components/Command"));
const Messages_1 = require("../components/Messages");
const main_1 = require("../main");
const conf = config_json_1.default.messages.commands.addonInfo;
const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
/*
 * Variables :
 * currentData : Objet contenant tous les addons, chaque addons contenant 1 tableau
 * Object.keys(data.data) : Tableau contenant tous les addons (avec case)
 * addons : Tableau contenant tous les addons (sans case)
 * myAddon : String avec le nom de l'addon recherché (avec case)
 * versions : Liste de toutes les versions de l'addon recherché
 */
function sendEmbed(message, addon) {
    return __awaiter(this, void 0, void 0, function* () {
        let size, unit;
        if (addon.data.bytes) {
            size = addon.data.bytes / 1000000;
            unit = "Mo";
            if (size < 1) {
                size *= 1000;
                unit = "Ko";
            }
        }
        const embed = new discord_js_1.RichEmbed()
            .setColor(config_json_1.default.bot.color)
            .setAuthor(`Informations sur ${addon.data.plugin}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
            .setDescription(addon.data.description || "Aucune description disponible.");
        if (addon.data.unmaintained)
            embed.addField(conf.embed.unmaintained, conf.embed.unmaintained_desc, true);
        if (addon.data.author)
            embed.addField(conf.embed.author, addon.data.author, true);
        if (addon.data.version)
            embed.addField(conf.embed.version, addon.data.version, true);
        if (addon.data.download)
            embed.addField(conf.embed.download, `[Téléchargez ici](${addon.data.download}) ${size.toFixed(2)} ${unit}`, true);
        if (addon.data.sourcecode)
            embed.addField(conf.embed.sourcecode, `[Voir ici](${addon.data.sourcecode})`, true);
        if (addon.data.depend && addon.data.depend.depend)
            embed.addField(conf.embed.depend, addon.data.depend.depend, true);
        if (addon.data.depend && addon.data.depend.softdepend)
            embed.addField(conf.embed.softdepend, addon.data.depend.softdepend, true);
        embed.setFooter(`Executé par ${message.author.username} | Données fournies par https://skripttools.net`);
        message.channel.send(embed);
    });
}
class AddonInfo extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'Addon';
        this.shortDescription = conf.shortDesc;
        this.longDescription = conf.longDesc;
        this.usage = `addon-info <addon>`;
        this.examples = ['addon-info skquery-lime', 'addonsinfos -list'];
        this.channels = ['*'];
        this.regex = /a(?:dd?ons?)?-?infos?/gimu;
        this.execute = (message, args) => __awaiter(this, void 0, void 0, function* () {
            if (args.length < 1) {
                Messages_1.discordError(conf.invalidCmd, message);
            }
            else {
                let msg = yield message.channel.send("Je vais chercher ça...");
                const addons = yield main_1.SkripttoolsSyntaxes;
                let myAddon = args.join(' ');
                if (myAddon === '-list')
                    return message.channel.send(conf.list.replace('%s', addons.join(', ')));
                let matchingAddons = addons.filter(elt => elt.data.plugin.toUpperCase().includes(myAddon.toUpperCase()));
                const results = matchingAddons.length;
                // On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
                matchingAddons = matchingAddons.slice(0, 10);
                if (matchingAddons.length === 0) {
                    yield msg.delete();
                    return Messages_1.discordError(conf.addonDoesntExist.replace("%s", `${myAddon}`), message);
                }
                else if (matchingAddons.length === 1) {
                    msg.delete();
                    return sendEmbed(message, matchingAddons[0]);
                }
                else {
                    yield msg.edit(`${results} élements trouvés pour la recherche \`${myAddon}\`. Quel addon vous interesse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);
                    for (let i = 0; i < matchingAddons.length; i++) {
                        msg = (yield msg.edit(`${msg.content}\n${reactionsNumbers[i]} ${matchingAddons[i].data.plugin}`));
                        yield msg.react(reactionsNumbers[i]);
                    }
                    yield msg.react('❌');
                    if (results - 10 > 0)
                        msg = (yield msg.edit(`${msg.content}\n...et ${results - 10} de plus...`));
                    const collectorNumbers = msg
                        .createReactionCollector((reaction, user) => !user.bot && user.id === message.author.id && reactionsNumbers.includes(reaction.emoji.name))
                        .once('collect', reaction => {
                        msg.delete();
                        sendEmbed(message, matchingAddons[reactionsNumbers.indexOf(reaction.emoji.name)]);
                        collectorNumbers.stop();
                    });
                    const collectorStop = msg
                        .createReactionCollector((reaction, user) => !user.bot && user.id === message.author.id && reaction.emoji.name === '❌')
                        .once('collect', () => {
                        message.delete();
                        msg.delete();
                        collectorNumbers.stop();
                        collectorStop.stop();
                    });
                }
            }
        });
    }
}
exports.default = AddonInfo;
