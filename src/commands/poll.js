/* eslint-disable camelcase */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable sort-keys */
import Discord from 'discord.js';

export default {

	title: "Sondage",
	description: "Lancer un sondage.",
	example: "poll",
	regex: /poll|vote/mu,
	permissions: ['Staff'],

	execute: async (message, command, args) => {

		const durations = {
			's(econd)?e?': 1,
			'min(ute)?': 60,
			'h(our|eure?)?': 3600,
			'(d(ay)?)|(j(our)?)': 86400,
			'mo(is|nth)?': 2.628000000,
			'(a(nn(é|e)e)?)|(y(ear)?)': 3.1540000000
		};

		let msg;

		for (let duration of Object.keys(durations)) {
			if (args[0].match(new RegExp(duration, 'gmu'))) {

				const mult = durations[duration],
					time = args[0].split(/[a-zA-Z]+/gmu)[0],
					embed = {
						embed: {
							color: 3447003,
							author: {
								name: `Vote de ${message.author.username} (${message.author.id})`,
								icon_url: message.author.avatarURL
							},
							title: args[1].replace(/_/gmu, ' '),
							description: `${args.splice(2, args.length).join(' ')}\n\nCe vote dure: ${args[0]}`,
							timestamp: new Date()
						}
					};

				msg = message.channel.send(embed);
				break;
			}
		}

		return msg.react('✅')
			.then(msg.react('❌'))
			.catch(error => console.error(`One of the emojis failed to react: ${error}`));

	}

};
