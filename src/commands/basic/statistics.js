import Command from '../../components/Command';
import { commands, client, config } from '../../main';
import pkg from "../../../package.json";
import Discord from 'discord.js';

class Statistics extends Command {

	constructor () {
		super('Statistics');
		this.regex = /stat(isti(c|que))?s?/gimu;
		this.usage = 'statistique'
		this.example = 'statistique'
	}

	async execute(message, args) {
		let totalSeconds = (client.uptime / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.floor(totalSeconds % 60);

		const onlineUsers = message.guild.members.filter(m => (m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd') && !m.user.bot).size;
		const totalUsers = message.guild.members.filter(m => !m.user.bot).size;
		const offlineUsers = totalUsers - onlineUsers;
		const totalBots = message.guild.members.filter(m => m.user.bot).size;
		const total = totalBots + totalUsers;

		const embed = new Discord.RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Statistiques sur le bot`, config.bot.avatar)
			.addField('Préfix', config.bot.prefix, true)
			.addField('Version', pkg.version, true)
			.addField('Temps de fonctionnement', `${days}j, ${hours}h, ${minutes}min et ${seconds}s`, true)
			.addField('Commandes', commands.length, true)
			.addField('Répartition des membres', `${onlineUsers} en ligne / ${offlineUsers} hors ligne / ${totalBots} bots`, true)
			.addField('Total', `${total} membres`, true)
			.addField('Développeurs', `${pkg.authors.join(', ')}`, true)
			.setFooter(`Executé par ${message.author.username}`)
			.setTimestamp();
		message.channel.send(embed);
	}

}

export default Statistics;
