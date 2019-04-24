import Discord, { Message, RichEmbed, ReactionCollector } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import { discordError, discordInfo } from "../components/Messages";

const durations: any = {
	's(ec(ond)?)?e?': 1,
	'min(ute)?': 60,
	'h(our|eure?)?': 3600,
	'(d(ay)?)|(j(our)?)': 86400
};
const reactions: string[] = ['✅', '❌', 'ℹ', '🛑'];

function endPoll(msg: Message, embed: RichEmbed, collectors: any, results: any) {
    embed.setColor(config.messages.success.color)
        .setDescription('Ce vote est finit !')
        .addField('Résultats :', `:white_check_mark: : ${results.yes} oui (${100 * results.yes / (results.yes + results.no) || 0}%)\n:x: : ${results.no} non (${100 * results.no / (results.yes + results.no) || 0}%)\n:bust_in_silhouette: : ${(results.yes + results.no)} votant(s).`);
    collectors.collector.stop();
    collectors.collectorStop.stop();
    msg.clearReactions();
    msg.edit(embed);
}

// Ajoute des zéros devant un nombre inférieur a 10.
// Permet d'avoir par exemple 08h08 au lieu de 8h8
function padNumber(x: number): string {
	return (x.toString().length < 2 ? "0" + x : x ).toString();
}

class Poll extends Command {

	name: string = 'Sondage';
	description: string = config.messages.commands.poll.description;
	examples: string[] = ['poll 10min Mon_titre Ma description'];
	regex: RegExp = /poll|vote|sond(?:age)?/gmui;
	permissions: string[] = this.permissions.concat(['Staff', 'Membre Actif']);

	execute = async (message: Message, args: string[]): Promise<void> => {
		if (args.length < 2) return discordError(config.messages.commands.poll.invalidCmd, message);
		for (let duration of Object.keys(durations)) {
			if (args[0].match(new RegExp(duration, 'gmui'))) {
				let wait: number, finished: boolean;
				let no: number = 0,
					yes: number = 0;

				let mult = durations[duration],
					time: any = args[0].split(/[a-zA-Z]+/gmui)[0];
				wait = mult * time * 1000;
                //wait = durations[duration] * args[0].split(/[a-zA-Z]+/gmui)[0] * 1000;
                let date: Date = new Date(Date.now() + wait);
                let end: string;

				if (date.getDate() === new Date(Date.now()).getDate())
					end = `aujourd'hui à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
				else if (date.getDate() - 1 === new Date(Date.now()).getDate())
					end = `demain à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
				else
					end = `le ${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${padNumber(date.getFullYear())} à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;

				let embed: RichEmbed = new RichEmbed()
					.setAuthor(`Vote de ${message.author.username}`, message.author.avatarURL)
					.setTitle(args[1].replace(/_/gmui, ' '))
					.setDescription(`${args.splice(2, args.length).join(' ')}\n\nCe vote dure : ${args[0]} (Finit ${end})`)
					.setFooter("Executé par " + message.author.username);

				let msg: Message = <Message> await message.channel.send(embed);
				for (let r of reactions) await msg.react(r);

				embed.setColor(config.bot.color);
				await msg.edit(embed);

				const collector: ReactionCollector = msg
					.createReactionCollector(
						(reaction, user) =>
							!user.bot &&
							(reaction.emoji.name === '✅' ||
							reaction.emoji.name === '❌' ||
							reaction.emoji.name === 'ℹ')
					)
					.once("collect", reaction => {
						if (reaction.emoji.name === '❌') no += 1;
						else if (reaction.emoji.name === '✅') yes += 1;
						else if (reaction.emoji.name === 'ℹ') discordInfo(config.messages.commands.poll.pollInfos, message);
					});

				const collectorStop: ReactionCollector = msg
					.createReactionCollector(
						(reaction, user) =>
							!user.bot &&
							reaction.emoji.name === '🛑' &&
							user.id === message.author.id
					)
					.once("collect", () => {
						const results = { yes, no },
							collectors = { collector, collectorStop };
						endPoll(msg, embed, collectors, results);
						finished = true;
					});

				setTimeout(() => {
					if (finished) return;
					const results = { yes, no },
						collectors = { collector, collectorStop };
					return endPoll(msg, embed, collectors, results);
				}, wait);

				return;
			}
		}
		discordError(config.messages.commands.poll.invalidCmd, message);
	}
	
};

export default Poll;
