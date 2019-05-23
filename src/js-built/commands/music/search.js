import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { functions } from '../../musicCore.js';
import { RichEmbed } from 'discord.js';
const { PlayMusicLink, musicSearch } = functions;

const emotes = ['❌', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

class Search extends Command {

	name = 'Recherche';
	shortDescription = config.messages.commands.search.shortDesc;
	longDescription = config.messages.commands.search.longDesc;
	usage = `${config.bot.prefix}search <musique>`;
	examples = ['search Despacito'];
	regex = /search/gimu;

	execute = async (message, args) => {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setFooter(`Executé par ${message.author.username}`);

		if (!args[0]) {
			embed.setTitle("Erreur");
			embed.setDescription("Tu dois mettre une recherche !");
			message.channel.send(embed);
		} else {
			const request = message.content.substring((args[0].length) + 2);
			embed.setTitle("Chercher une musique");
			embed.setDescription(`Recherche en cours sur Youtube pour **${request}**...`);
			
			const msg = await message.channel.send(embed);
			let cach = await musicSearch(request);
			
			if (cach === "none") {
				embed.setDescription(`Je n'ai trouvé aucun résultat pour ${request} !`);
				message.channel.send(embed);
				return;
			}
			
			delete cach[0];
			for (let i in cach) {
				embed.addField(`Résultat n°${i}`, cach[i][0]);
			}
			embed.setDescription(`Voila les résultats que j'ai trouvé pour '**${request}**' !`);
			msg.edit(embed);
			await msg.react(emotes[0]);

			const collector = msg
				.createReactionCollector((reaction, user) => {
					if (!user.bot) {
						reaction.remove(user);
						if (user.id === message.author.id) {
							if (!user.lastMessage.member.voiceChannel) {
								message.channel.send("Tu as quitté le canal vocal !");
								message.delete();
								collector.stop();
							} else return true;
						}
					}
				}).on("collect", reaction => {
					const choice = reaction.emoji.identifier.substring(0, 1);
					
					if (choice >= 1 && choice <= 8) {
						msg.clearReactions();
						cach[choice][2] = "http://youtube.com/watch?v=" + cach[choice][2];
						const music = new PlayMusicLink(msg, message.author, cach[choice]);
						music.checkDependencies(true);
						setTimeout(() => msg.clearReactions(), 500);
					} else {
						msg.delete();
					}
					collector.stop();
				});

			for (let i = 1; i < cach.length; i++) {
				if (msg.embeds[0].title != "Chercher une musique") break;
				try {
					await msg.react(emotes[i]);
				} catch(err) {
					console.error(err);
				}
			}
		}
	}

}

export default Search;
