import Command from '../../components/Command';
import Setup from '../../setup';
import Discord from 'discord.js';

class Statistics extends Command {

	constructor () {
		super('Statistics');
		this.regex = /stat(isti(c|que))?s?/gmui;
	}

	async execute(message, args) {
		let totalSeconds = (Setup.client.uptime / 1000);
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
			.setColor(Setup.config.messages.colors.info)
			.setAuthor(`Statistiques sur le bot`, Setup.client.user.avatarURL)
			.addField('Préfix', Setup.config.bot.prefix, true)
			.addField('Version', Setup.pkg.version, true)
			.addField('Temps de fonctionnement', `${days}j, ${hours}h, ${minutes}min et ${seconds}s`, true)
			.addField('Commandes', Setup.commands.length, true)
			.addField('Répartition des membres', `${onlineUsers} en ligne / ${offlineUsers} hors ligne / ${totalBots} bots`, true)
			.addField('Total', `${total} membres`, true)
			.addField('Développeurs', `${Setup.pkg.authors.join(', ')}`, true)
			.setFooter(`Executé par ${message.author.username}`, message.author.avatarURL)
			.setTimestamp(new Date());
		message.channel.send(embed);
	}

}

export default Statistics;