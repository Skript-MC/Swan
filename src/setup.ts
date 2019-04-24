import Discord, { Client } from 'discord.js';
import fs, { readdirSync } from 'fs';
import config from '../config/config.json';
import Command from './components/Command';

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

	return commands;
}
