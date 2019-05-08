import { Message, ReactionCollector } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

const conf: any = config.messages.commands.findmyerror;
const reactionsNumbers: Array<string> = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class FindMyError extends Command {

	name: string = 'Trouve Mon Erreur';
	shortDescription: string = conf.shortDesc;
	longDescription: string = conf.longDesc;
	usage: string = `trouvemonerreur`;
	examples: string[] = ['findmyerror', 'trouvemonerreur'];
	regex: RegExp = /(?:findmyerr?or|trouvemonerr?eure?)/gmui;

	execute = async (message: Message, args: string[]): Promise<void> => {
		let msg: Message = <Message> await message.channel.send(conf.hub);
		for (let reaction of reactionsNumbers)
			await msg.react(reaction);
		await msg.react('❌');
		const collector: ReactionCollector = msg
			.createReactionCollector((reaction, user) =>
				!user.bot &&
				user.id === message.author.id &&
				(reactionsNumbers.includes(reaction.emoji.name) || reaction.emoji.name === '❌')
			)
			.once('collect', async reaction => {
				let edit: string;
				switch (reaction.emoji.name) {
					case '1⃣':
						edit = `__Indentation error :__\n\n${conf.error.indentation}`;
						break;
					case '2⃣':
						edit = `__Can't understand this XX :__\n\n${conf.error.cantunderstand}`;
						break;
					case '3⃣':
						edit = `__Empty configuration section :__\n\n${conf.error.emptysection}`;
						break;
					case '4⃣':
						edit = `__Invalid use of quotes :__\n\n${conf.error.invalidquotes}`;
						break;
					case '5⃣':
						edit = `__There's no loop that match XX :__\n\n${conf.error.noloopmatch}`;
						break;
					case '6⃣':
						edit = `__"else" has to be place just after an "if" :__\n\n${conf.error.elseafterif}`;
						break;
					case '7⃣':
						edit = `__Can't compare XX with XX :__\n\n${conf.error.cantcompare}`;
						break;
					case '8⃣':
						edit = `__XX is not a valid item data :__\n\n${conf.error.notvaliditemdata}`;
						break;
					case '9⃣':
						edit = `__XX can't be added to XX :__\n\n${conf.error.cantbeadded}`;
						break;
					case '🔟':
						edit = `__Autres erreurs :__\n\n${conf.error.other}`;
						break;
					case '❌':
						message.delete()
						msg.delete();
						collector.stop()
						return;
				}
				await msg.edit(edit);
				await msg.clearReactions();
				await msg.react('↩');
				await msg.react('❌');
				const collector2: ReactionCollector = msg
					.createReactionCollector((reaction, user) =>
						!user.bot &&
						user.id === message.author.id &&
						(reaction.emoji.name === '↩' || reaction.emoji.name === '❌')
					)
					.once('collect', reaction => {
						msg.delete();
						collector.stop()
						collector2.stop();
						if (reaction.emoji.name === '↩')
							this.execute(message, args);
						else if (reaction.emoji.name === '❌')
							message.delete()
					});
			});
	}
};

export default FindMyError;
