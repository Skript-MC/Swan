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
const setup_1 = require("./setup");
const messages_1 = require("./components/messages");
const Messages_1 = require("./components/Messages");
const config_json_1 = __importDefault(require("../config/config.json"));
exports.commands = setup_1.loadCommands().catch(err => messages_1.error(err));
exports.SkripttoolsSyntaxes = setup_1.loadSkripttoolsAPI().catch(err => messages_1.error(err));
exports.SkriptHubSyntaxes = setup_1.loadSkriptHubAPI().catch(err => messages_1.error(err));
exports.client = setup_1.loadDiscord()
    .catch(err => {
    if (err.match(/is not a constructor/gmui)) {
        messages_1.error(`You didn't export your command! (real error: ${err})`);
    }
});
exports.test = 1;
exports.client.then(client => {
    const discord = client;
    discord.on('ready', () => {
        discord.user.setActivity('.aide | Skript-Mc', { type: 'WATCHING' });
        Messages_1.success('SkriptMc bot loaded!');
        // Met à jour les APIs (tous les jours à 05h00)
        setInterval(() => {
            const now = new Date(Date.now());
            if (now.getHours() === 5 && now.getMinutes() === 0) {
                messages_1.info("5h00 : Reloading APIs...");
                exports.SkripttoolsSyntaxes = setup_1.loadSkripttoolsAPI().catch(err => messages_1.error(err));
                exports.SkriptHubSyntaxes = setup_1.loadSkriptHubAPI().catch(err => messages_1.error(err));
            }
        }, 60000);
    });
    discord.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
        if (message.author.bot)
            return;
        if (message.system)
            return; // Message envoyé par discord. ex: quand on pin un message
        if (message.channel.id === config_json_1.default.miscellaneous.ideaChannelId)
            message.react('✅').then(() => message.react('❌'));
        if (message.channel.id === config_json_1.default.miscellaneous.snippetChannelId && !message.member.roles.find(r => r.name === "Staff")) {
            // On vérifie que ce ne soit pas lui qui ai posté le dernier message... Si jamais il dépasse les 2k charactères, ou qu'il veut apporter des précisions par exemple.
            const previousAuthorId = yield message.channel.fetchMessages({ before: message.channel.lastMessageID, limit: 1 }).then(elt => elt.first().author.id);
            if (previousAuthorId !== message.author.id && !message.content.match(/```(?:(?:.+|\n))*```/gimu)) {
                message.delete();
                message.member.send(`Merci d'éviter le spam dans ${message.channel}. Votre message ne contient pas de blocs de code... Comment voulez vous partager du code sans bloc de code ?? Si vous ne savez simplement pas faire de bloc de codes, regardez ici : <https://support.discordapp.com/hc/fr/articles/210298617>`);
            }
        }
        exports.commands.then(cmds => {
            const commands = cmds;
            for (let command of commands) {
                const regex = new RegExp(`^\\${config_json_1.default.bot.prefix}${command.regex.source}`, command.regex.flags);
                if (message.content.match(regex)) {
                    if (!command.channels || (!command.channels.includes(message.channel.id)) && !command.channels.includes('*')) {
                        return;
                    }
                    else if (config_json_1.default.bot.forbidden_channels.includes(message.channel.id)) {
                        return message.delete();
                    }
                    else if (command.permissions && command.permissions.length > 0) {
                        for (let permission of command.permissions) {
                            if (message.member.roles.find(role => role.name === permission)) {
                                command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
                                break;
                            }
                        }
                    }
                    else
                        command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
                    break;
                }
            }
        });
    }));
    discord.on('error', console.error);
});
