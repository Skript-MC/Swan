"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("./setup");
const messages_1 = require("./components/messages");
const Messages_1 = require("./components/Messages");
const config_json_1 = __importDefault(require("../config/config.json"));
exports.commands = setup_1.loadCommands().catch(err => messages_1.error(err));
exports.SkriptHubSyntaxes = setup_1.loadSkriptHubAPI().catch(err => messages_1.error(err));
exports.client = setup_1.loadDiscord()
    .catch(err => {
    if (err.match(/is not a constructor/gmui)) {
        messages_1.error(`You didn't export your command! (real error: ${err})`);
    }
});
exports.client.then(client => {
    const discord = client;
    discord.on('ready', () => {
        discord.user.setActivity('.aide | Skript-Mc', { type: 'WATCHING' });
        Messages_1.success('SkriptMc bot loaded!');
    });
    discord.on('message', message => {
        if (message.author.bot)
            return;
        exports.commands.then(cmds => {
            const commands = cmds;
            for (let command of commands) {
                const regex = new RegExp(`^\\${config_json_1.default.bot.prefix}${command.regex.source}`, command.regex.flags);
                if (message.content.match(regex)) {
                    if ((!command.channels) || (!command.channels.includes(message.channel.id)) && !command.channels.includes('*')) {
                        return;
                    }
                    if (command.permissions && command.permissions.length > 0) {
                        for (let permission of command.permissions) {
                            if (message.member.roles.find(role => role.name === permission)) {
                                command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
                                break;
                            }
                        }
                    }
                    else {
                        command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
                    }
                }
            }
        });
    });
    discord.on('error', console.error);
});
