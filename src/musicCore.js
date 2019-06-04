import ytdl from "ytdl-core";
import request from "request";
import { RichEmbed } from 'discord.js';
import config from '../../config/config.json';
import { error } from './components/Messages';
const key = config.bot.tokens.google;

let serverQueues = [];

function musicSearch(req, nbr = 8) {
	return new Promise(resolve => {
		let r = req.replace(" ", "%20");
		let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${nbr}&order=relevance&q=${r}&safeSearch=moderate&type=video&videoCategoryId=10&key=${key}`;
		request({
			url: url,
			json: true
		}, (error, response, body) => {
			try {
				if (!error && response.statusCode === 200) {
					let a = ["nop"];
					for (let i in body.items) {
						let j = body.items[i].snippet.title;
						if (a.indexOf(j) == -1) {
							a.push([j, body.items[i].snippet.thumbnails.medium.url, body.items[i].id.videoId]);
						}
					}
					if (a[1]) resolve(a);
					resolve("none");
				} else throw new Error();

			} catch (error) {
				console.error(error);
			}
		})
	});
}

class ServerQueue {
	constructor() {
		this.queue = [];
	}
	getNextLink() {
		if (this.queue[0]) return this.queue[0][2];
		return;
	}
	getNextIcon() {
		if (this.queue[0]) return this.queue[0][1];
		return;
	}
	getNextName() {
		if (this.queue[0]) return this.queue[0][0];
		return;
	}
	addMusic(music) {
		this.queue.push(music);
	}
}

class PlayMusicLink {
	constructor(message, fuser, link) {
		this.message = message
		this.user = fuser.lastMessage.member
		if (!link[4]) {
			this.details = new Object()
			this.details.title = link[0]
			this.details.icon = link[1]
			this.link = link[2]
		} else {
			this.link = link
		}
		if (message.guild.voiceConnection) this.connection = message.guild.voiceConnection
	}

	async init() {
		let a = await this.getVideoDetails()
		this.details = new Object()
		this.details.title = a[0]
		this.details.icon = a[1]
	}

	setMessage(type, text) {
		const embed = new RichEmbed()
			.setColor(config.bot.color)
		embed.setTitle(type)
		if (text == true) {
			embed.setThumbnail(this.details.icon)
			embed.setDescription(`Écoutons ** ${this.details.title}** !`)
		} else embed.setDescription(text)
		if (this.message.author.bot) this.message.edit(embed)
		else this.message.channel.send(embed)
	}

	checkDependencies(andPlay, playNow) {
		if (new RegExp(/^(https?:\/\/)?(www\.)?youtube.com\/watch\?v=[a-zA-Z0-9-_]{11}$/gimu).test(this.link)) {
			if (andPlay) {
				if (playNow) {
					serverQueues[this.message.guild.id].direct_tmp = true
					this.finalPlay()
				} else this.queueCheck()
			} else return true
		} else {
			this.setMessage("erreur", "Je ne vois aucune musique sur ce lien ! :cry:")
			return
		}
	}

	queueCheck() {
		if (!serverQueues[this.message.guild.id]) serverQueues[this.message.guild.id] = new ServerQueue()
		try {
			if (this.message.guild.voiceConnection.dispatcher) {
				this.setMessage("queue", "La musique **" + this.details.title + "** a été rajoutée dans la queue !")
				serverQueues[this.message.guild.id].addMusic([this.details.title, this.details.icon, this.link])
				return
			}
		} catch (e) {}
		this.finalPlay()
	}

	async finalPlay(replay) {
		if (!replay) this.setMessage("play", true)
		if (!this.connection) {
			await this.user.voiceChannel.join();
			this.connection = this.message.guild.voiceConnection
		}

		this.connection.playStream(ytdl(this.link, {
			filter: "audioonly"
		}))


		this.connection.dispatcher.setVolume(5 / 17.5)
		this.connection.dispatcher.on('error', err => {
			if (e.message === "TypeError: Cannot read property 'encode' of null") return;
			console.error(err);
		});
		this.connection.dispatcher.on('end', e => {
			const embed = new RichEmbed()
				.setColor(config.bot.color)
			if (serverQueues[this.message.guild.id].getNextLink()) {
				embed.setTitle("Jouer une musique")
				embed.setDescription("Musique suivante ! Jouons " + serverQueues[this.message.guild.id].getNextLink())
				this.details.title = serverQueues[this.message.guild.id].getNextName()
				this.details.icon = serverQueues[this.message.guild.id].getNextIcon()
				this.link = serverQueues[this.message.guild.id].getNextLink()
				serverQueues[this.message.guild.id].queue.shift()
				embed.setDescription()
				this.finalPlay(true)

			} else {
				if (!this.message.guild.voiceConnection.dispatcher) {
					if (serverQueues[this.message.guild.id].direct_tmp) {
						delete serverQueues[this.message.guild.id].direct_tmp
						return
					}
					setTimeout(() => {
						if (!this.message.guild.voiceConnection) return;
					}, 5000);
					embed.setTitle("Jouer une musique")
					embed.setDescription("Il n'y a plus aucune musique musique à jouer ! Je m'en vais")
					this.message.channel.send(embed)
					this.connection.disconnect()
				}
			}
		})
	}


	getVideoDetails() {
		return new Promise(resolve => {
			if (this.link.indexOf("?") == -1) return
			let id = this.link.substring(this.link.indexOf("?") + 3)
			let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&hl=fr&id=${id}&key=${key}`
			request({
				url: url,
				json: true
			}, async function (error, response, body) {
				try {
					if (!error && response.statusCode === 200) {
						resolve([body.items[0].snippet.localized.title, body.items[0].snippet.thumbnails.medium.url])
					} else throw new Error()
				} catch (error) {
					sendError("Fonction getVideoDetails", error)
				}
			})
		});
	}
}

export const variables = { serverQueues };
export const functions = { ServerQueue, PlayMusicLink, musicSearch };
