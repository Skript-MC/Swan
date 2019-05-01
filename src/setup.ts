import Discord, { Client } from 'discord.js';
import { readdirSync } from 'fs';
import config from '../config/config.json';
import Command from './components/Command';
import { error, info, success } from './components/Messages';
import fetch from 'node-fetch';

export async function loadSkriptHubAPI(): Promise<any[]> {
	const back = [];
	let syntaxes: any;
	syntaxes = await fetch(`${config.miscellaneous.api_syntax}/syntax/`, {
		method: 'GET',
		headers: {
			'Authorization': `Token ${config.miscellaneous.tokenApiSyntax}`
		}
	}).then(response => {
		if (response.status !== 200) error(`[HTTP request failed] Error : ${response.status}`);
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
			'Authorization': `Token ${config.miscellaneous.tokenApiSyntax}`
		}
	}).then(response => {
		if (response.status !== 200) error(`[HTTP request failed] Error : ${response.status}`);
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

export async function loadDiscord(): Promise<Client> {
	const discord: Client = new Discord.Client();
	discord.login(config.bot.token);
	return discord;
}

export async function loadCommands(): Promise<Command[]> {
	const commands: Array<Command> = [];
	const files: string[] = await readdirSync('./src/commands');

	for (let file of files) {
		const command: any = require(`${__dirname}/commands/${file}`).default;
		const cmd: Command = new command();
		cmd.setup();
		commands.push(cmd);
	}

	success('All commands have been loaded!')
	return commands;
}

export const SkriptHub = {};
