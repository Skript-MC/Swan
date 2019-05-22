import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import config from '../../config/config.json';
import { error, success, info } from './components/Messages';
import fetch from 'node-fetch';

export async function loadSkriptHubAPI() {
	const back = [];
	let syntaxes;
	syntaxes = await fetch(`${config.miscellaneous.api_syntax}/syntax/`, {
		method: 'GET',
		headers: {
			'Authorization': `Token ${config.bot.tokens.skripthub}`
		}
	}).then(response => {
		if (response.status !== 200) return error(`[HTTP request failed] Error : ${response.status}`);
		return response.json();
	}).then(response => {
		const syntaxes = {};
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

export async function loadSkripttoolsAPI() {
	const allAddons = [];

	// On récupère toutes les versions de tous les addons
	let allAddonsVersions = await fetch(config.miscellaneous.api_addons, { method: 'GET' })
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

export async function loadDiscord() {
	const discord = new Client();
	discord.login(config.bot.tokens.discord);
	return discord;
}

export async function loadCommands() {
	info('Loading commands...');
	const commands = [];
	const subdirs = ['moderation', 'music', 'info', 'basic', 'fun'];
	for (let subdir of subdirs) {
		const files = await readdirSync(`${__dirname}/commands/${subdir}`);
		for (let file of files) {
			if (file === '.DS_Store') continue;
			// info(`Loading file ${file}`);
			try {
				const command = require(`${__dirname}/commands/${subdir}/${file}`).default;
				const cmd = new command();
				cmd.module = subdir;
				cmd.setup();
				commands.push(cmd);
			} catch(err) {
				console.error(err);
			}
		}
	}

	success('All commands have been loaded!')
	return commands;
}
