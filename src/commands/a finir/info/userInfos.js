import { RichEmbed } from "discord.js";
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import config from "../../../config/config.json";
import { formatDate } from "../../utils";

const conf = config.messages.commands.userInfos;

function explain(status) {
	if (status === 'online')
		return "En ligne";
	else if (status === 'idle')
		return "AFK";
	else if (status === 'dnd')
		return "Ne pas déranger";
	else if (status === 'offline')
		return "Hors ligne";
	else
		return "Une erreur est survenue.";
}

class UserInfos extends Command {
	
	name = 'Info membre';
	shortDescription = conf.shortDesc;
	longDescription = conf.longDesc;
	usage = `${config.bot.prefix}user-info <@mention | ID>`;
	examples = ['userinfo @noftaly', 'user-infos 188341077902753794'];
	regex = /(?:user|utilisateur)-?info(?:rmation)?s?-?(?:utilisateur)?s?/gmui;

	execute = async (message, args) => {
		const target = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
		if (!target) return discordError(conf.pseudoNotFound, message);

		let roles = [];
		for (let role of target.roles.array()) {
			if (role.name !== "@everyone") {
				roles.push(role);
			}
		}
		
		let presence = '';
		presence += `Statut : ${explain(target.presence.status)}\n`;
		if (target.presence.game) {
			if (target.presence.game.type === 0)
				presence += `Joue à \`${target.presence.game.name}\`\n`;
			else if (target.presence.game.type === 1)
				presence += `Est en live\n`;
			else if (target.presence.game.type === 2)
				presence += `Écoute : ${target.presence.game.name}\n`;
			else if (target.presence.game.type === 3)
				presence += `Regarde : ${target.presence.game.name}\n`;

			if (target.presence.game.details)
				presence += `↳ ${target.presence.game.details}\n`;
			if (target.presence.game.party)
				presence += `↳ ${target.presence.game.party}\n`;
			if (target.presence.game.state)
				presence += `↳ ${target.presence.game.state}\n`;
			if (target.presence.game.timestamps)
				presence += `↳ À commencé ${formatDate(target.presence.game.timestamps.start)}\n`;
		}

		const embed = new RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Informations sur le membre ${target.user.username}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setFooter(`Executé par ${message.author.username}`)
			.addField(conf.embed.names, `Pseudo : ${target.user.username}\nSurnom : ${target.displayName}\nIdentifiant : ${target.id}\n`, true)
			.addField(conf.embed.joined, `${formatDate(new Date(target.joinedTimestamp))}`, true)
			.addField(conf.embed.roles, `${target.roles.array().length - 1} : ${roles.join(", ")}`, true)
			.addField(conf.embed.presence, presence, true);
		
		message.channel.send(embed);
	}
}
	
export default UserInfos;
