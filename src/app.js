import Discord from "discord.js";
import readdir from "fs-readdir-promise";
import fs from "fs-extra";

import to from "@helpers/To";

export default class  {

	constructor(config) {
		this.config = config;
	}

	async loadDiscord() {
		const discord = new Discord.Client();
		discord.login(this.config.bot.token);

		return discord;
	}

	async loadPlaylists() {
		const playlist = [];

		let [err, files] = await to(readdir('./playlists'));
		if (err) throw err;

		for (let file of files) {
			[err, file] = await to(fs.readJson(`./playlists/${file}`));
			if (err) throw err;

			playlist.push(file);
		}

		return playlist;
	}

	async loadCommands() {
		const commands = [];

		let [err, files] = await to(readdir('./src/commands'));
		if (err) throw err;

		for (let file of files) {
			const module = require(`@commands/${file}`);
			if (err) throw err;
			commands.push(module.default);
		}

		return commands;
	}
}
