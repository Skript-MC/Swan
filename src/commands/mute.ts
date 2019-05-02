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

async function createRole(message: Message): Promise<Role> {
	let role: Role = message.guild.roles.find(r => r.name === config.moderation.muteRole);
	if (!role) {
		try {
			role = await message.guild.createRole({
				name: config.moderation.muteRole,
				color: "#000000"
			});
			message.guild.channels.forEach(async (channel, id) => {
				await channel.overwritePermissions(role, {
					SEND_MESSAGES: false,
					ADD_REACTIONS: false,
					SEND_TTS_MESSAGES: false,
					SPEAK: false,
					CHANGE_NICKNAME: false
				});
			});
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
	usage: string = `${config.bot.prefix}mute <@mention | ID> <durée> [raison]`;
	examples: string[] = ['mute'];
	channels: string[] = ['*'];
	regex: RegExp = /mute/gmui;
	permissions: string[] = ['Staff'];

	execute = async (message: Message, args: string[]): Promise<any> => {
		const victim: GuildMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
		if (!victim) return discordError(conf.missingUserArgument, message);
		if (!args[1]) return discordError(conf.missingTimeArgument, message);
		//if (victim.id === message.author.id) return discordError(conf.unableToSelfMute, message);
		//if (victim.highestRole.position >= message.member.highestRole.position) return discordError(conf.userTooPowerful, message);

		for (let d of Object.keys(durations)) {
			if (args[1].replace(/\d+/g, '') === d) {
				let multiple: any = durations[d],
					duration: string = "Infinie",
					end: string = "";

				let role: Role = <Role> await createRole(message);

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
					.replace("%r", args.splice(2).join(" ") || "*aucune raison spécifiée*")
					.replace("%d", duration);
				discordSuccess(success, message);

				return modLog({
					color: "#ff6b61",
					member: victim,
					mod: message.author,
					action: "Mute",
					duration: duration,
					finish: end,
					reason: args.splice(2).join(" ") || "Aucune raison spécifiée"
				}, message.guild);
			}
		}
		discordError(conf.wrongDuration, message);
	}
};

export default Mute;
