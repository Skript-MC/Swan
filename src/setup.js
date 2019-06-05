import fs from 'fs';
import axios from 'axios';
import { error, success } from './components/Messages';
import { config, commands } from './main';
import Discord from 'discord.js';

export function loadBot(token) {
	const client = new Discord.Client()
	client.login(config.bot.tokens.discord);
	return client;
}

export async function loadCommands(path) {
	if (!path) path = 'commands';
	fs.readdir(`${__dirname}/${path}`, (err, files) => {
		if (err) throw err;
		for (let file of files) {
			const stat = fs.statSync(`${__dirname}/${path}/${file}`);
			if (stat.isDirectory()) {
				loadCommands(`${path}/${file}`);
			} else {
				try {
					const module = require(`${__dirname}/${path}/${file}`).default;
					const command = new module();
					command.init();
					commands.push(command);
				} catch (e) {
					error(`This command can't load: ${file}\n\n${e.message}`);
				}
			}
		}
	})
}

export async function loadSkriptHubAPI() {
	const options = {
		method: 'GET',
		headers: {
			'Authorization': `Token ${config.bot.tokens.skripthub}`
		}
	}
	let syntaxes = axios(`${config.miscellaneous.api_syntax}/syntax/`, options)
		.then(response => {
			for (let syntax of response.data) {
				syntaxes[syntax.id] = syntax;
			}
		}).catch(err => error(err.message));

	await axios(`${config.miscellaneous.api_syntax}/syntaxexample/`, options)
		.then(response => {
			for (let example of response.data) {
				if (syntaxes[example.syntax_element]) {
					syntaxes[example.syntax_element].example = example;
				}
			}
		}).catch(err => error(err.message))

	success('SkriptHub\'s api loaded!');
	return syntaxes;
}

export async function loadSkripttoolsAPI() {
	const options = {
		method: 'GET',
		headers: {
			'Authorization': `Token ${config.bot.tokens.skripthub}`
		}
	}

	let addons = await axios(config.miscellaneous.api_addons, options)
		.then(response => {
			return response.data.data;
		}).catch(err => error(err.message));

	for (let addon of Object.keys(addons)) {
		const versions = addons[addon];
		const latest = versions[versions.length - 1];
		addon = await axios(`${config.miscellaneous.api_addons}${latest}`, options)
			.then(response => {
				return response;
			}).catch(err => error(err.message));

		addons[addon] = addon;
	}

	success('Skripttools\'s api loaded!');
	return addons;
}