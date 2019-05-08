import { Message, GuildMember, Client, Role, TextChannel, GuildChannel } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import { modLog } from "../components/Log";
import { discordError, discordSuccess, error } from "../components/messages";
import { formatDate } from "../utils";

const conf: any = config.messages.commands.mute;
const durations: any = {
	's': 1,
	'min': 60,
	'h': 3600,
	'd': 86400,
	'j': 86400,
	'mo': 2629800,
	'def': -1
};
const mutePerms: any = {
	SEND_MESSAGES: false,
	ADD_REACTIONS: false,
	SEND_TTS_MESSAGES: false,
	SPEAK: false,
	CHANGE_NICKNAME: false
}

async function createRole(message: Message, type: string): Promise<Role> {
	let role: Role = message.guild.roles.find(r => r.name === config.moderation.muteRole);
	if (!role) {
		try {
			let name: string;
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
				color: 0x000001, // 0x000000 ne fonctionne pas
				position: config.moderation.muteRolePosition
			});
			if (name.includes('autre')) {
				let chan: GuildChannel = message.guild.channels.find(chan => chan.id === config.moderation.channelIdHelpOther);
				await chan.overwritePermissions(role, mutePerms);
			} else if (name.includes('serveur')) {
				let chan: GuildChannel = message.guild.channels.find(chan => chan.id === config.moderation.channelIdHelpServer);
				await chan.overwritePermissions(role, mutePerms);
			} else if (name.includes('skript')) {
				let chan: GuildChannel = message.guild.channels.find(chan => chan.id === config.moderation.channelIdHelpSkript);
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

	name: string = 'Mute';
	shortDescription: string = conf.shortDesc;
	longDescription: string = conf.longDesc;
	usage: string = `mute <@mention | ID> <durée> <type> [raison]`;
	examples: string[] = ['mute'];
	channels: string[] = ['*'];
	regex: RegExp = /mute/gmui;
	permissions: string[] = ['Staff'];

	execute = async (message: Message, args: string[]): Promise<any> => {
		const victim: GuildMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
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
				let multiple: any = durations[d],
					duration: string = "Infinie",
					end: string = "";

				let role: Role = <Role> await createRole(message, args[2]);

				if (victim.roles.has(role.id)) return discordError(conf.alreadyMuted.replace("%u", victim), message);
				await victim.addRole(role);

				if (multiple !== -1) { // Si ce n'est pas un ban def
					let time: any = args[1].split(/[a-zA-Z]+/gmui)[0];
					let wait: number = multiple * time * 1000;    // Temps (en millisecondes) de la sanction
					let date: Date = new Date(Date.now() + wait); // Date (en millisecondes) à laquelle la sanction expire
					duration = args[1];
					end = formatDate(date);
				}
				
				const success: string = conf.successfullyMuted
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
