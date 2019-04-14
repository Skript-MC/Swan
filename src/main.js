/* eslint-disable no-unused-vars */
/* eslint-disable max-statements */

import 'module-alias/register';

import Config from '../config/config.json';
import app from './app';
import to from "@helpers/To";

const App =  new app(Config);

(async function f() {

	let err, commands, discord;

	[err, commands] = await to(App.loadCommands());
	if (err) throw err;
	[err, discord] = await to(App.loadDiscord());
	if (err) throw err;

	// eslint-disable-next-line no-console
	console.log('Client discord lancé');

	discord.on('message', async payload => {

		if (payload.author.bot) return;
		if (payload.channel.type === 'dm') return;
		if (payload.channel.id !== Config.bot.channel) return;

		const message = payload.content.toLowerCase().split(" ");

		for (let command of commands) {

			const search = message[0].search(new RegExp(`^${Config.bot.prefix}${command.regex.source}`, command.regex.flags));
			let hasRole = false;

			if (search === -1) continue;
			if (command.permissions.length > 0) {
				for (let index = 0; index < command.permissions.length; index += 1) {
					if (payload.member.roles.find(role => role.name === `${command.permissions[index]}`)) {
						hasRole = true;
						break;
					}
				}
			} else {
				hasRole = true;
			}

			if (hasRole) {
				await command.execute(payload, message.splice(0, 1), message.splice(0, message.length));
			} else {
				payload.reply('Vous n\'avez pas la permission d\'executer cette commande.');
			}

			break;
		}
	});
	
	  discord.on("messageReactionAdd", async (messageReaction, user) => {
	  	doMessageReaction(messageReaction, user);
	  });

	  discord.on("messageReactionRemove", async (messageReaction, user) => {
	  	doMessageReaction(messageReaction, user);
	  });
})();
