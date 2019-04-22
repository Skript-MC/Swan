/* eslint-disable sort-keys */
import main from '../main.js';

export default {

	title: "Skript Event",
	description: "Lancer un événement Skript-MC.",
	examples: ['skript-event'],
	regex: /skript-event/gmui,
	permissions: ['Staff', 'Membre Actif'],

	execute: async (message, command, args) => {
		const mentions = message.mentions.members;

		for (let [key, value] of mentions) {
			let msg = message.content.replace(new RegExp(value, 'gmu'), '').replace(/\s\s/gmu, ' '),
				points = msg.split(' ').splice(1, 1);

			console.log(main)
			//	main.users[key].points += points;
			//	main.logs.push(`[${new Date().toLocaleDateString()}] ${message.author.username} (${message.author.id}) a donné ${points} points à ${key}.`);
		}

		return console.log(true);
	}

};
