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
const discord_js_1 = __importDefault(require("discord.js"));
const fs_1 = require("fs");
const config_json_1 = __importDefault(require("../config/config.json"));
const Messages_1 = require("./components/Messages");
const node_fetch_1 = __importDefault(require("node-fetch"));
function loadSkriptHubAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        const back = [];
        let syntaxes;
        syntaxes = yield node_fetch_1.default(`${config_json_1.default.miscellaneous.api_syntax}/syntax/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${config_json_1.default.miscellaneous.tokenApiSyntax}`
            }
        }).then(response => {
            if (response.status !== 200)
                Messages_1.error(`[HTTP request failed] Error : ${response.status}`);
            return response.json();
        }).then(response => {
            const syntaxes = {};
            for (let syntax of response) {
                syntaxes[syntax.id] = syntax;
            }
            return syntaxes;
        }).catch(err => Messages_1.error(err));
        syntaxes = yield node_fetch_1.default(`${config_json_1.default.miscellaneous.api_syntax}/syntaxexample/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${config_json_1.default.miscellaneous.tokenApiSyntax}`
            }
        }).then(response => {
            if (response.status !== 200)
                Messages_1.error(`[HTTP request failed] Error : ${response.status}`);
            return response.json();
        }).then(response => {
            for (let example of response) {
                if (syntaxes[example.syntax_element]) {
                    syntaxes[example.syntax_element].example = example;
                }
            }
            return syntaxes;
        }).catch(err => Messages_1.error(err));
        for (let key of Object.keys(syntaxes)) {
            back.push(syntaxes[key]);
        }
        Messages_1.success('SkriptHub\'s api loaded!');
        return back;
    });
}
exports.loadSkriptHubAPI = loadSkriptHubAPI;
function loadDiscord() {
    return __awaiter(this, void 0, void 0, function* () {
        const discord = new discord_js_1.default.Client();
        discord.login(config_json_1.default.bot.token);
        return discord;
    });
}
exports.loadDiscord = loadDiscord;
function loadCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        const commands = [];
        const files = yield fs_1.readdirSync('./src/commands');
        for (let file of files) {
            const command = require(`${__dirname}/commands/${file}`).default;
            const cmd = new command();
            cmd.setup();
            commands.push(cmd);
        }
        Messages_1.success('All commands have been loaded!');
        return commands;
    });
}
exports.loadCommands = loadCommands;
exports.SkriptHub = {};
