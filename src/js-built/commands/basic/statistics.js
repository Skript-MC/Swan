import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import config from "../../../../config/config.json";
import pkg from "../../../../package.json";
import { client, commands } from "../../main";

class Statistics extends Command {

	name = 'Statistiques';
	shortDescription = config.messages.commands.statistics.shortDesc;
	longDescription = config.messages.commands.statistics.longDesc;
	usage = `${config.bot.prefix}stats`;
	examples = ['stats'];
	regex = /stat(?:isti(?:c|que))?s?/gmui;

	execute = async (message, args) => {
		const clnt = await client;

		let totalSeconds = (clnt.uptime / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.floor(totalSeconds % 60);

		const allCmds = await commands;
		const cmds = allCmds.length;

		const onlineUsers = message.guild.members.filter(m => (m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd') && !m.user.bot).size;
		const totalUsers = message.guild.members.filter(m => !m.user.bot).size;
		const offlineUsers = totalUsers - onlineUsers;
		const totalBots = message.guild.members.filter(m => m.user.bot).size;
		const total = totalBots + totalUsers;

		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Statistiques sur le bot`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.addField('Préfix', config.bot.prefix, true)
			.addField('Version', pkg.version, true)
			.addField('Temps de fonctionnement', `${days}j, ${hours}h, ${minutes}min et ${seconds}s`, true)
			.addField('Commandes', cmds, true)
			.addField('Répartition des membres', `${onlineUsers} en ligne / ${offlineUsers} hors ligne / ${totalBots} bots`, true)
			.addField('Total', `${total} membres`, true)
			// .addField('Développeurs', `${pkg.authors.join(', ')}`, true)
			.setFooter(`Executé par ${message.author.username}`)
			.setTimestamp();
		message.channel.send(embed);
	}
};

export default Statistics;
