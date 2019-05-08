import Command from '../components/Command';
import config from '../../config/config.json';
import { Message, MessageCollector } from 'discord.js';
import { error } from '../components/Messages';

const conf: any = config.messages.commands.ticket;
const questions: any = {
	"Quel est votre type de problème ?": {
		'global': [],
		'site': [],
		'demande d\'aide skript': [
			'Quelle est votre version de serveur (Faites `/version` dans votre console de serveur) ?',
			'Quelle est votre version de Skript (Faites `/version skript` dans votre console de serveur) ?',
			'Quels sont vos addons ? (Faites `/plugins` dans votre console de serveur)',
			'Quels est votre code ? (Le code comportant un(e) problème/erreur)',
			'Quel est précisemment votre problème ? (Donner toutes les erreurs que vous avez sous lien <https://hastebin.com>)'
		],
		'demande d\'aide serveur': [],
		'demande d\'aide java': [],
		'discord': []
	},
	"Merci d'avoir utiliser notre service de tickets. N'hésitez pas à dire ce que vous en avez pensé.": {
		'très mauvais': ['Merci de nous avoir partagé votre avis!'],
		'mauvais': ['Merci de nous avoir partagé votre avis!'],
		'passable': ['Merci de nous avoir partagé votre avis!'],
		'bien': ['Merci de nous avoir partagé votre avis!'],
		'très bien': ['Merci de nous avoir partagé votre avis!'],
		'excellent': ['Merci de nous avoir partagé votre avis!']
	}
};

class Ticket extends Command {

	name: string = 'Ticket';
	shortDescription: string = conf.shortDesc;
	longDescription: string = conf.longDesc;
	regex: RegExp = /ticket/gmui;
	usage: string = 'ticket';
	examples: string[] = ['ticket', 'ticket Aled'];

	execute: Function = async (message: Message, args: string[]): Promise<void> => {
		
		for (let key of Object.keys(questions)) {
			const question: Message = <Message> await message.reply(`${key} (${Object.keys(questions[key]).join(', ')})`);
			const answers: string[] = [];

			let answer: Message = <Message> await message.channel.awaitMessages(response => 
				!response.author.bot &&
				response.author.id === message.author.id &&
				Object.keys(questions[key]).some(possibility => possibility.toLowerCase() === response.content.toLowerCase()),
			
				{ maxMatches: 1, time: 120000, errors: ['time'] }
			
			).then(collected => {
				return collected.first();
			}).catch(err => console.error(err));

			answer.delete();
			for (let type of Object.keys(questions[key])) {
				if (answer.content === type) {
					console.log('yeah!')
					for (let i = 0; i < Object.keys(questions[key][type]).length; i++) {

						//question.edit(questions[key][type]);
						await answer.channel.awaitMessages(response =>
							!response.author.bot &&
							response.author.id === answer.author.id,
							{ maxMatches: 1, time: 120000, errors: ['time'] })

						.then(collected => {
							console.log("collecté");
							// return;
						}).catch(err => console.error(err));
						// const question = Object.keys(questions[key])[type][i];
						// answers[i] = await message.reply(question);
					}
					break;
				}
			}	
		}	
	};

}

export default Ticket;
