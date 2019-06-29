import fs from 'fs';
import axios from 'axios';
import Discord from 'discord.js';
import { success } from './components/Messages';
import { config, commands } from './main';
require('dotenv').config();

const apikeys = {
    discord: process.env.DISCORD_API,
	skripthub: process.env.SKRIPTHUB_API
};

export function loadBot() {
	const client = new Discord.Client()
	client.login(apikeys.discord);
	return client;
}


export async function loadCommands(path) {
	if (!path) path = 'commands';
	console.log(`loading : ${path}`);
	fs.readdir(`${__dirname}/${path}`, (err, files) => {
		if (err) throw err;
		for (let file of files) {
			const stat = fs.statSync(`${__dirname}/${path}/${file}`);
			if (stat.isDirectory()) {
				loadCommands(`${path}/${file}`);
			} else if (file === ".DS_Store") {
				continue;
			} else {
				try {
					const module = require(`${__dirname}/${path}/${file}`).default;
					const command = new module();
					command.init();
					command.category = path.replace('commands/', '');
					commands.push(command);
				} catch (e) {
					console.error(`Unable to load this command: ${file}`);
					console.error(e);
				}
			}
		}
	})
}

export async function loadSkriptHubAPI() {
	const options = {
		method: 'GET',
		headers: {
			'Authorization': `Token ${apikeys.skripthub}`
		}
	}

	let syntaxes = [];
	await axios(`${config.miscellaneous.api_syntax}/syntax/`, options)
		.then(response => {
			for (let syntax of response.data) {
				syntaxes[syntax.id] = syntax;
			}
		}).catch(err => console.error(err.message));

	await axios(`${config.miscellaneous.api_syntax}/syntaxexample/`, options)
		.then(response => {
			for (let example of response.data) {
				if (syntaxes[example.syntax_element]) {
					syntaxes[example.syntax_element].example = example;
				}
			}
		}).catch(err => console.error(err.message));

	success('SkriptHub\'s api loaded!');
	return syntaxes;
}

export async function loadSkripttoolsAPI() {
	const options = { method: 'GET' };
	const addons = [];

	const allAddons = await axios(config.miscellaneous.api_addons, options)
		.then(response => {
			return response.data.data;
		}).catch(err => console.error(err.message));

	for (let addon of Object.keys(allAddons)) {
		const versions = allAddons[addon];
		const latest = versions[versions.length - 1];
		addon = await axios(`${config.miscellaneous.api_addons}${latest}`, options)
			.then(response => {
				return response.data.data;
			}).catch(err => console.error(err.message));
		addons.push(addon);
	}

	success('Skripttools\'s api loaded!');
	return addons;
}
