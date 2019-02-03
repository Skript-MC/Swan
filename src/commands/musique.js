import musique from "./musique.js";
import playlists from "../app.js";
import ytdl from "ytdl-core";

const servers = {}

export default {

	regex: 'musi(c|que)',
	channel: '533791418259341317',
	permissions: [],

	execute: async message => {
		let args = message.content.toLowerCase().split(" ");
		args.shift();

		// Joue une musique 
		// Usage:
		// |> .music play https://www.youtube.com/watch?v=0_TABUp9gaw

		if (new RegExp("^\\b(play|jouer?)\\b").test(args[0].toLowerCase())) {
			if (ytdl.validateURL(args[1])) {
				if (musique.permissions.length < 1 || message.member.roles.find(role => musique.permissions.includes(role.name))) {
					if (message.member.voiceChannelID === musique.channel) {
						if (!servers[message.guild.id]) {
							servers[message.guild.id] = {
								queue: [],
								message: [],
								skip: [],
								playing: false
							}
						}
						let server = servers[message.guild.id];
						server.queue.push(args[1]);
						message.member.voiceChannel.join().then(connection => play(connection, message));

					} else {
						message.reply("Vous devez être dans le channel de musique pour utiliser cette commande.");
						return message.delete();
					}
				} else {
					message.reply("Vous n'avez pas la permission d'executer cette commande.");
					return message.delete();
				}
			} else {
				message.reply("Votre lien doit être un lien YouTube.");
				return message.delete();
			}


		// Récupère les informations d'une musique.
		// Conditions:
		// |> Une musique doit être jouée.
		// Usage:
		// |> .music current

		} else if (new RegExp("^\\b(current|playing|now|maintenant|actuel(le)?|jou(é|e(r|z)?))\\b").test(args[0].toLowerCase())) {
			if (message.member.voiceChannelID === musique.channel) {
				const server = servers[message.guild.id];
				if (server.playing === false) {
					message.reply("Aucune musique n'est jouée pour le moment.");
					return;
				}
				let infos = await ytdl.getInfo(String(server.queue[0]));
				const videoID = function() {
					const regex = new RegExp("^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*", "g");
					const match = regex.exec(server.queue[0]);;
					if (match && match[2].length == 11) {
						return match[2];
					} else {
						message.reply("Erreur: url YouTube invalide.");
					}
				}
				let embed = new Discord.RichEmbed()
					.setTitle("Musique jouée !")
					.setAuthor(infos.author.name, infos.author.avatar, infos.author.channel_url)
					.setThumbnail("https://img.youtube.com/vi/%id%/maxresdefault.jpg".replace("%id%", videoID))
					.setColor(config["musique"]["jouer"]["embed"]["couleur"])
					.setDescription(
						"**Titre:** " + infos.media.song + "\n" +
						"**Artiste:** " + infos.media.artist+ "\n\n" +
						"➡️ [Clique ici pour ouvrir la musique sur YouTube](" + infos.video_url + ")"
						)
					.setFooter("Exécuté par " + message.member.user.username);
				
				let msg = await message.reply(embed);
				msg.react("↪").then(() => msg.react("⏸"));

			}
			
		// Playlists
		// Usage:
		// |> .music current

		} else if (new RegExp("^\\b(playlist)\\b").test(args[0].toLowerCase())) {
			
			// Créer une playlist
			// Usage:
			// |> .music playlist create test

			if (new RegExp("^\\b(cre(ate|e(z|r)))\\b").test(args[1].toLowerCase())) {
				if (message.member.roles.find(role => config["musique"]["playlists"]["creation"]["permissions"].includes(role.name)))
					if (args[2] != undefined) {
						if (playlists[message.author.id] === undefined || playlists[message.author.id][args[2]] === undefined) {
							playlists[message.author.id] = {};
							playlists[message.author.id][args[2]] = [];
							message.reply(succes("Nouvelle playlist créée!", config["musique"]["playlists"]["creation"]["succes"].replace("%playlist%", args[2])));
							return message.delete();
						} else {
							message.reply(erreur(config["musique"]["playlists"]["erreurs"]["existe déjà"].replace("%playlist%", args[2])));
							return message.delete();
						}
							
					} else {
						message.reply(erreur(config["musique"]["playlists"]["erreurs"]["aucun nom"]));
						return message.delete();
					}
				else {
					message.reply(erreur(config["erreurs"]["permission"]));
					return message.delete();
				}
			
			// Supprime une playlist
			// Usage:
			// |> .music playlist delete test

			} else if (new RegExp("^\\b(delete|supprim(e|é|e(r|z)))\\b").test(args[1].toLowerCase())) {
				if (message.member.roles.find(role => config["musique"]["playlists"]["suppression"]["permissions"].includes(role.name)))
					if (args[2] != undefined) {
						if (playlists[message.author.id] != undefined 
							&& playlists[message.author.id][args[2]] != undefined) 
						{
							delete playlists[message.author.id][args[2]];
							if (config["musique"]["playlists"]["auto save"] === true) refreshPlaylist(message.author.id);
							message.reply(succes("Playlist supprimée!", config["musique"]["playlists"]["suppression"]["succes"].replace("%playlist%", args[2])));
							return message.delete();
						}
					} else {
						message.reply(erreur(config["musique"]["playlists"]["erreurs"]["aucun nom"]));
						return message.delete();
					}
				else {
					message.reply(erreur(config["erreurs"]["permission"]));
					return message.delete();
				}

			// Ajoute les musiques d'une playlist à la file d'attente
			// Usage:
			// |> .music playlist play test

			} else if (new RegExp("^\\b(jou(é|e(z|r))|play)\\b").test(args[1].toLowerCase())) {
				if (message.member.roles.find(role => config["musique"]["playlists"]["jouer"]["permissions"].includes(role.name)))
					if (args[2] != undefined) {
						if (message.member.voiceChannelID === musique.channel) {
							if (playlists[message.author.id][args[2]] != undefined && playlists[message.author.id][args[2]].length > 0) {
								if (!servers[message.guild.id]) {
									servers[message.guild.id] = {
										queue: [],
										message: [],
										skip: [],
										playing: false
									};
								}
								const server = servers[message.guild.id];
								for (musique in playlists[message.author.id][args[2]]) {
									server.queue.push(playlists[message.author.id][args[2]][musique]);
								}
								message.member.voiceChannel.join().then(connection => play(connection, message));
						
							} else {
								message.reply(erreur(config["musique"]["playlists"]["erreurs"]["n'existe pas"]));
								return message.delete();
							}
						
						} else {
							message.reply(erreur(config["musique"]["erreurs"]["channel"].replace("%channel%", "``" + message.member.guild.channels.find(channel => channel.id === musique.channel).name + "``")));
							return message.delete();
						}						
					} else {
						message.reply(erreur(config["musique"]["playlists"]["erreurs"]["aucun nom"]));
						return message.delete();
					}
				else {
					message.reply(erreur(config["erreurs"]["permission"]));
					return message.delete();
				}

			// Affiche la liste de nos playlist
			// Usage:
			// |> .music playlist list

			} else if (new RegExp("^\\b(liste?)\\b").test(args[1].toLowerCase())) {
				let embed = new Discord.RichEmbed()
					.setTitle("Liste des playlists disponibles")
					.setDescription("Voici la liste de vos playlists:")
					.setColor(config["bot"]["embeds_couleur"])
					.setFooter("Executé par " + message.author.username);

				let liste = [];
				for (name in playlists[message.author.id]) {
					for (info in playlists[message.author.id][name]) {
						let infos = await ytdl.getInfo(String(playlists[message.author.id][name][info]));
						liste.push(" \\* [" + infos.media.song + " - " + infos.media.artist + "](" + playlists[message.author.id][name][info] + ")");
					}
					embed.addField(name + ":", liste.join("\n"));
				}
				message.reply(embed);

			// Ajoute une musique à une playlist
			// Usage:
			// |> .music playlist test add https://www.youtube.com/watch?v=neDFHyWPtTM

			} else if (new RegExp("^\\b(add|ajout(é|e(r|z)?)?)\\b").test(args[2].toLowerCase())) { 
				if (message.member.roles.find(role => config["musique"]["playlists"]["modifications"]["ajout"]["permissions"].includes(role.name))) {
					if (playlists[message.author.id][args[1]] != undefined) {
						if (args[3] != undefined) {
							if (!playlists[message.author.id][args[1]].includes(args[3])) {
								const server = servers[message.guild.id];
								let link = args[3];
								if (new RegExp("^\\b(actuel(le)?|playing|now|maintenant|jou(e(e|r|z)?|ée?))\\b").test(args[3].toLowerCase())) {
									link = server.queue[0];
								}
								playlists[message.author.id][args[1]].push(link);
								if (config["musique"]["playlists"]["auto save"] === true) refreshPlaylist(message.author.id);
								message.reply(succes("Nouvelle musique dans la playlist!", config["musique"]["playlists"]["modifications"]["ajout"]["succes"].replace("%playlist%", args[1])));
								return message.delete();

							} else {
								message.reply(erreur(config["musique"]["playlists"]["erreurs"]["déjà dedans"].replace("%playlist%", args[1])));
								return message.delete();
							}
								
						} else {
							message.reply(erreur(config["musique"]["playlists"]["erreurs"]["lien"]));
							return message.delete();
						}
					} else {
						message.reply(erreur(config["musique"]["playlists"]["erreurs"]["mauvaise playlist"].replace("%playlist%", args[1])));
						return message.delete();
					}
				} else {
					message.reply(erreur(config["erreurs"]["permission"]));
					return message.delete();
				}
			
			// Supprime une musique d'une playlist
			// Usage:
			// |> .music playlist test remove https://www.youtube.com/watch?v=neDFHyWPtTM

			} else if (new RegExp("^\\b(re(move|tir(e|é|e(r|z)))|enlev(e|é|e(r|z)))\\b").test(args[2].toLowerCase())) { 
				if (message.member.roles.find(role => config["musique"]["playlists"]["modifications"]["ajout"]["permissions"].includes(role.name))) {
					if (playlists[message.author.id][args[1]] != undefined) {
						if (args[3] != undefined) {

							for (let i = 0; i < playlists[message.author.id][args[1]].length; i++) {
								let item = playlists[message.author.id][args[1]][i];
								let infos = await ytdl.getInfo(String(item));
								if (new RegExp("^\\b(actuel(le)?|playing|now|maintenant|jou(e(e|r|z)?|ée?))\\b").test(args[3].toLowerCase())) {
									item = server.queue[0];
								}
								if (
									i === parseInt(args[3]) 
									|| item === args[3]
									|| infos.video_url === args[3]
									|| infos.media.song.includes(args[3])
								){
									playlists[message.author.id][args[1]].splice(i, 1)
									message.reply(succes("Musique enlevée la playlist!", config["musique"]["playlists"]["modifications"]["suppression"]["succes"]
										.replace("%playlist%", args[1])
										.replace("%music title%", infos.media.song)
										.replace("%music author%", infos.media.artist)
									));
									if (config["musique"]["playlists"]["auto save"] === true) refreshPlaylist(message.author.id);
									break;

								} else {
									message.reply(erreur("Aucune musique trouvée de ce nom dans votre playlist ``" + args[1] + "``"));
								}
							}

						} else {
							message.reply(erreur(config["musique"]["playlists"]["erreurs"]["lien"]));
							return message.delete();
						}
					} else {
						message.reply(erreur(config["musique"]["playlists"]["erreurs"]["mauvaise playlist"].replace("%playlist%", args[1])));
						return message.delete();
					}
				} else {
					message.reply(erreur(config["erreurs"]["permission"]));
					return message.delete();
				}

			// Affiche la liste des musiques d'une playlist
			// Usage:
			// |> .music playlist test list

			} else if (new RegExp("^\\b(liste?|musi(c|que)s)\\b").test(args[2].toLowerCase())) {
				if (playlists[message.author.id] != undefined 
					&& playlists[message.author.id] != undefined
					&& playlists[message.author.id][args[1]].length > 0
				) {
					let liste = [];
					let musiques = playlists[message.author.id][args[1]];
					for (i = 0; i < musiques.length; i ++) {
						let infos = await ytdl.getInfo(String(musiques[i]));
						liste.push("**" + i + ")** [" + infos.media.song + " - " + infos.media.artist + "](" + musiques[i] + ")");
					}
					let videoID = function() {
						const regex = new RegExp("^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*", "g");
						const match = regex.exec(musiques[0]);
						if (match && match[2].length == 11) {
							return match[2];
						} else {
							message.reply("Erreur: url YouTube invalide.");
							return message.delete();
						}
					}
					videoID = "https://img.youtube.com/vi/%id%/maxresdefault.jpg".replace("%id%", videoID);
					let embed = new Discord.RichEmbed()
						.setTitle("Liste des musiques de la playlist ``" + args[1] + "``")
						.setDescription(liste.join("\n"))
						.setColor(config["bot"]["embeds_couleur"])
						.setFooter("Executé par " + message.author.username)
						.setThumbnail(videoID);
					
					message.reply(embed);
					
				} else {
					message.reply(erreur(config["musique"]["playlists"]["erreurs"]["n'existe pas"].replace("%playlist%", args[2])));
					return message.delete();
				}
			}

		// Arrête la musique du bot
		// Usage:
		// |> .music stop

		} else if (new RegExp("^\\b(stop)\\b").test(args[0].toLowerCase())) {
			if (musique.permissions.length < 1 || message.member.roles.find(role => musique.permissions.includes(role.name))) {
				const server = servers[message.guild.id];
				if (server.dispatcher) server.dispatcher.end();
			}

		// Fait quitter le bot du channel de musique
		// Usage:
		// |> .music leave

		} else if (new RegExp("^\\b(leave|quitte)\\b").test(args[0].toLowerCase())) {
			if (musique.permissions.length < 1 || message.member.roles.find(role => musique.permissions.includes(role.name))) {
				bot.voiceConnections.find(function(c) {
					if (c.channel.guild.id === message.guild.id) return c.channel;
				}).disconnect();
			}

		} else {
			message.reply("Cette commande n'existe pas.");
		}
	}

}

async function play(connection, message){
	let server = servers[message.guild.id];
	let stream = ytdl(server.queue[0], {filter: 'audioonly'});
	let videoID = function() {
		const regex = new RegExp("^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*", "g")
		const match = regex.exec(server.queue[0]);
		if (match && match[2].length == 11) {
			return match[2];
		} else {
			message.channel.send("Erreur: url YouTube invalide.");
		}
	}
	let infos = await ytdl.getInfo(String(server.queue[0]));
	let embed = new Discord.RichEmbed()
		.setTitle("Nouvelle musique ajoutée par " + message.author.username)
		.setAuthor(infos.author.name, infos.author.avatar, infos.author.channel_url)
		.setThumbnail("https://img.youtube.com/vi/%id%/maxresdefault.jpg".replace("%id%", videoID))
		.setColor(config["musique"]["ajouter"]["embed"]["couleur"])
		.setDescription(
			"**Titre:** " + infos.media.song + "\n" +
			"**Artiste:** " + infos.media.artist + "\n\n" +
			"➡️ [Clique ici pour ouvrir la musique sur YouTube](" + infos.video_url + ")"
			)
		.setFooter("Exécuté par " + message.member.user.username)
	await message.channel.send(embed).then(function(msg) {
		server.message.push(msg);
	});
	message.delete();
	
	if (server.playing === false) {
		let title = infos.media.song || infos.title
		let author = infos.media.artist || infos.author.name
		let embed = new Discord.RichEmbed()
			.setTitle("Musique jouée !")
			.setAuthor(infos.author.name, infos.author.avatar, infos.author.channel_url)
			.setThumbnail("https://img.youtube.com/vi/%id%/maxresdefault.jpg".replace("%id%", videoID))
			.setColor(config["musique"]["jouer"]["embed"]["couleur"])
			.setDescription(
				"**Titre:** " + title + "\n" +
				"**Artiste:** " + author + "\n\n" +
				"➡️ [Clique ici pour ouvrir la musique sur YouTube](" + infos.video_url + ")\n\n" +
				"**Commandes:**\n\n" +
				"↪ skip ; ⏸ pause"
				)
			.setFooter("Exécuté par " + message.member.user.username)
		let msg = await server.message[0].edit(embed)
		msg.react("↪").then(() => msg.react("⏸"));
		server.dispatcher = connection.playStream(stream);
		server.dispatcher.setVolume(0.5);
		server.playing = true;
	}
	server.dispatcher.on("end", function() {
		if (server.queue[1]) {
			server.message.shift();
			server.queue.shift();
			play(connection, message);
		} else {
			server.playing = false;
		}
	});
}