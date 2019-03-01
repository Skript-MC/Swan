import 'module-alias/register';

import Config from '../config/config.json';
import app from './app';
import to from '@helpers/To';

const App =  new app(Config);

(async function f() {

	let err, commands, discord;

	[err, commands] = await to(App.loadCommands());
	if (err) throw err;
	[err, discord] = await to(App.loadDiscord());
	if (err) throw err;

	console.log('Client discord lancé');

	discord.on('message', async payload => {

		if (payload.author.bot || payload.channel.type === 'dm' || payload.channel.id !== Config.bot.channel) return;

		const message = payload.content.toLowerCase().split(" ");
		for (let command of commands) {

			const search = message[0].search(`^${Config.bot.prefix}${command.regex}`);
			if (search === -1) continue;

			await command.execute(payload, message.splice(1));
			return;
		}
	});
})();
