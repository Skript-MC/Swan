import Discord, { Client } from 'discord.js';
import { readdirSync } from 'fs';
import config from '../config/config.json';
import Command from './components/Command';
import { error, success } from './components/Messages';
import fetch from 'node-fetch';

export async function loadSkriptHubAPI(): Promise<any[]> {
	const back: any[] = [];
	let syntaxes: any;
	syntaxes = await fetch(`${config.miscellaneous.api_syntax}/syntax/`, {
		method: 'GET',
		headers: {
			'Authorization': `Token ${config.bot.tokens.skripthub}`
		}
	}).then(response => {
		if (response.status !== 200) return error(`[HTTP request failed] Error : ${response.status}`);
		return response.json();
	}).then(response => {
		const syntaxes: any = {};
		for (let syntax of response) {
			syntaxes[syntax.id] = syntax;
		}
		return syntaxes;
	}).catch(err => error(err));

	syntaxes = await fetch(`${config.miscellaneous.api_syntax}/syntaxexample/`, {
		method: 'GET',
		headers: {
			'Authorization': `Token ${config.bot.tokens.skripthub}`
		}
	}).then(response => {
		if (response.status !== 200) return error(`[HTTP request failed] Error : ${response.status}`);
		return response.json();
	}).then(response => {
		for (let example of response) {
			if (syntaxes[example.syntax_element]) {
				syntaxes[example.syntax_element].example = example;
			}
		}
		return syntaxes;
	}).catch(err => error(err));

	for (let key of Object.keys(syntaxes)) {
		back.push(syntaxes[key]);
	}

	success('SkriptHub\'s api loaded!');
	return back;
}

export async function loadSkripttoolsAPI(): Promise<any[]> {
	const allAddons: any = [];

	// On récupère toutes les versions de tous les addons
	let allAddonsVersions: any = await fetch(config.miscellaneous.api_addons, { method: 'GET' })
	.then(response => {
		if (response.status !== 200) return error(`[HTTP request failed] Error : ${response.status}`);
		return response.json();
	}).then(response => {
		return response;
	}).catch(err => error(err));

	// Puis pour chaque addon...
	for (let addon of Object.keys(allAddonsVersions.data)) {
		// ...on récupère toutes ses versions...
		let versions = allAddonsVersions.data[addon];
		// ...pour ensuite récupérer la dernière...
		const latest = versions[versions.length - 1].replace(' ', '+');
		// ...pour ensuite appeler l'API et aller chercher les infos sur l'addon
		const addonInfo = await fetch(`${config.miscellaneous.api_addons}${latest}`, { method: 'GET' })
		.then(response => {
			if (response.status !== 200) return error(`[HTTP request failed] Error : ${response.status}`);
			return response.json();
		}).then(response => {
			return response;
		}).catch(err => error(err));

		allAddons.push(addonInfo);
	}

	success('Skripttools\'s api loaded!');
	return allAddons;
}

export async function loadDiscord(): Promise<Client> {
	const discord: Client = new Discord.Client();
	discord.login(config.bot.tokens.discord);
	return discord;
}

export async function loadCommands(): Promise<Command[]> {
	const commands: Array<Command> = [];
	const files: string[] = await readdirSync('./src/commands');
	for (let file of files) {
		if (file === '.DS_Store') continue;
		const command: any = require(`${__dirname}/commands/${file}`).default;
		const cmd: Command = new command();
		cmd.setup();
		commands.push(cmd);
	}

	success('All commands have been loaded!')
	return commands;
}
