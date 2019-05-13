import Command from '../components/Command';
import config from "../../../config/config.json";
import { modLog } from "../components/Log";
import { discordError, discordSuccess, error } from "../components/messages";
import { formatDate } from "../utils";

const conf = config.messages.commands.mute;
const durations = {
	's': 1,
	'min': 60,
	'h': 3600,
	'd': 86400,
	'j': 86400,
	'mo': 2629800,
	'def': -1
};
const mutePerms = {
	SEND_MESSAGES: false,
	ADD_REACTIONS: false,
	SEND_TTS_MESSAGES: false,
	SPEAK: false,
	CHANGE_NICKNAME: false
}

async function createRole(message, type) {
	let role = message.guild.roles.find(r => r.name === config.moderation.muteRole);
	if (!role) {
		try {
			let name;
			switch (type.toUpperCase()) {
				case "AUTRE":
					name = `${config.moderation.muteRole} - Aide autre`;
					break;
				case "SERVEUR":
					name = `${config.moderation.muteRole} - Aide serveur`;
					break;
				case "SKRIPT":
					name = `${config.moderation.muteRole} - Aide skript`;
					break;
				case "GLOBAL":
					name = `${config.moderation.muteRole}`;
					break;
				default:
					name = `${config.moderation.muteRole}`;
			}
			role = await message.guild.createRole({
				name: name,
				color, // 0x000000 ne fonctionne pas
				position: config.moderation.muteRolePosition
			});
			if (name.includes('autre')) {
				let chan = message.guild.channels.find(chan => chan.id === config.moderation.channelIdHelpOther);
				await chan.overwritePermissions(role, mutePerms);
			} else if (name.includes('serveur')) {
				let chan = message.guild.channels.find(chan => chan.id === config.moderation.channelIdHelpServer);
				await chan.overwritePermissions(role, mutePerms);
			} else if (name.includes('skript')) {
				let chan = message.guild.channels.find(chan => chan.id === config.moderation.channelIdHelpSkript);
				await chan.overwritePermissions(role, mutePerms);
				chan = message.guild.channels.find(chan => chan.id === config.moderation.channelIdHelpSkript2);
				await chan.overwritePermissions(role, mutePerms);
			} else {
				message.guild.channels.forEach(async (channel, id) => {
					await channel.overwritePermissions(role, mutePerms);
				});
			}
		} catch (err) {
			error(`Error while attempting to create the role : ${err}`);
		}
	}
	return role;
}

class Mute extends Command {

	name = 'Mute';
	shortDescription = conf.shortDesc;
	longDescription = conf.longDesc;
	usage = `${config.bot.prefix}mute <@mention | ID> <durée> [raison]`;
	examples = ['mute'];
	channels = ['*'];
	regex = /mute/gmui;
	permissions = ['Staff'];

	execute = async (message, args) => {
		const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
		if (!victim) return discordError(conf.missingUserArgument, message);
		if (!args[1]) return discordError(conf.missingTimeArgument, message);
		if (!args[2]) return discordError(conf.missingTypeArgument, message);
		if (args[2].toUpperCase() !== 'SKRIPT' &&
			args[2].toUpperCase() !== 'SERVEUR' &&
			args[2].toUpperCase() !== 'AUTRE' &&
			args[2].toUpperCase() !== 'GLOBAL')
			return discordError(conf.invalidTypeArgument, message);
		// if (victim.id === message.author.id) return discordError(conf.unableToSelfMute, message);
		// if (victim.highestRole.position >= message.member.highestRole.position) return discordError(conf.userTooPowerful, message);

		for (let d of Object.keys(durations)) {
			if (args[1].replace(/\d+/g, '') === d) {
				let multiple = durations[d],
					duration = "Infinie",
					end = "";

				let role = await createRole(message, args[2]);

				if (victim.roles.has(role.id)) return discordError(conf.alreadyMuted.replace("%u", victim), message);
				await victim.addRole(role);

				if (multiple !== -1) { // Si ce n'est pas un ban def
					let time = args[1].split(/[a-zA-Z]+/gmui)[0];
					let wait = multiple * time * 1000;    // Temps (en millisecondes) de la sanction
					let date = new Date(Date.now() + wait); // Date (en millisecondes) à laquelle la sanction expire
					duration = args[1];
					end = formatDate(date);
				}
				
				const success = conf.successfullyMuted
					.replace("%u", `${victim}`)
					.replace("%r", args.splice(3).join(' ') || "*aucune raison spécifiée*")
					.replace("%d", duration);
				discordSuccess(success, message);

				return modLog({
					color: "#ff6b61",
					member: victim,
					mod: message.author,
					action: `Mute (${args[2].toUpperCase() === 'GLOBAL' ? `global` : `aide ${args[2].toLowerCase()}`})`,
					duration: duration,
					finish: end,
					reason: args.splice(3).join(' ') || "Aucune raison spécifiée"
				}, message.guild);
			}
		}
		discordError(conf.wrongDuration, message);
	}
};

export default Mute;
