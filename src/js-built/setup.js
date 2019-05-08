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
                'Authorization': `Token ${config_json_1.default.bot.tokens.skripthub}`
            }
        }).then(response => {
            if (response.status !== 200)
                return Messages_1.error(`[HTTP request failed] Error : ${response.status}`);
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
                'Authorization': `Token ${config_json_1.default.bot.tokens.skripthub}`
            }
        }).then(response => {
            if (response.status !== 200)
                return Messages_1.error(`[HTTP request failed] Error : ${response.status}`);
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
function loadSkripttoolsAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        const allAddons = [];
        // On récupère toutes les versions de tous les addons
        let allAddonsVersions = yield node_fetch_1.default(config_json_1.default.miscellaneous.api_addons, { method: 'GET' })
            .then(response => {
            if (response.status !== 200)
                return Messages_1.error(`[HTTP request failed] Error : ${response.status}`);
            return response.json();
        }).then(response => {
            return response;
        }).catch(err => Messages_1.error(err));
        // Puis pour chaque addon...
        for (let addon of Object.keys(allAddonsVersions.data)) {
            // ...on récupère toutes ses versions...
            let versions = allAddonsVersions.data[addon];
            // ...pour ensuite récupérer la dernière...
            const latest = versions[versions.length - 1].replace(' ', '+');
            // ...pour ensuite appeler l'API et aller chercher les infos sur l'addon
            const addonInfo = yield node_fetch_1.default(`${config_json_1.default.miscellaneous.api_addons}${latest}`, { method: 'GET' })
                .then(response => {
                if (response.status !== 200)
                    return Messages_1.error(`[HTTP request failed] Error : ${response.status}`);
                return response.json();
            }).then(response => {
                return response;
            }).catch(err => Messages_1.error(err));
            allAddons.push(addonInfo);
        }
        Messages_1.success('Skripttools\'s api loaded!');
        return allAddons;
    });
}
exports.loadSkripttoolsAPI = loadSkripttoolsAPI;
function loadDiscord() {
    return __awaiter(this, void 0, void 0, function* () {
        const discord = new discord_js_1.default.Client();
        discord.login(config_json_1.default.bot.tokens.discord);
        return discord;
    });
}
exports.loadDiscord = loadDiscord;
function loadCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        const commands = [];
        const files = yield fs_1.readdirSync('./src/commands');
        for (let file of files) {
            if (file === '.DS_Store')
                continue;
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
