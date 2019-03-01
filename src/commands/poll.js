import Discord from "discord.js";
import Config from "../../config/config.json";
import poll from "./poll.js";

export default {

	regex: '(poll|vote)',
	permissions: [],

	execute: async message => {
		if (poll.permissions.length < 1 || message.member.roles.find(role => poll.permissions.includes(role.name))) {
			const times = [
				/s(econd(e)s?)?/gm, 
				/m(inutes?)?/gm, 
				/h((our|eure)s?)?/gm, 
				/(d(ays?)?)|(j(ours?)?)/gm,
				/w(eeks?)/gm,
				/months?/gm,
				/y(ears?)?/gm
			];
			const filter = (reaction, user) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌' && user.id !==  Config.bot.id;
			let args = message.content.toLowerCase().split(" ");
			let index = 1;

			args.shift();
			times.forEach(time => {
				
				if (args[0].match(time)) {
					
					let t = args[0].split("");
					const duration = t[0] * (Math.pow(60, index) * 1000);

				}

				index ++;

			});

			let embed = new Discord.RichEmbed()
				.setAuthor("Sondage de " + message.author, message.author.avatarURL)
				.setDescription(args[1]);
			
			message.channel.send(embed)
				.then(() => message.react("✅"))
				.then(() => message.react("❌"))

			message.awaitReactions(filter, {time: duration})
				.then(collected => console.log(`Collected ${collected.size} reactions`))
				.catch(console.error);

		} else {
			return message.reply("Vous n'avez pas la permission d'executer cette commande.");
		}
	}
}