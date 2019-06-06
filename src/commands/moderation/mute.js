import Command from '../../components/Command';
import { modLog } from '../../components/Log';
import Sanction from '../../components/Sanction';
import { sanctions } from '../../main';
import { discordError, discordSuccess } from '../../components/Messages';

const durations = {
	'(\d+)s(econde?s?)?': 1,
	'(\d+)min(ute?)?': 60,
	'(\d+)h((e|o)ure?s?)?': 3600,
	'(\d+)(d(ay)?|j(our)?)s?': 86400,
	'(\d+)mo(is|onths?)?': 2629800,
	'(\d+)def(initi(f|ve)': -1
};

class Mute extends Command {

	constructor () {
		super('Mute');
		this.usage = 'mute <@mention | ID> <durée> <raison>';
		this.example = 'mute @AlexLew 5d Test';
	}

	async execute(message, args) {
		const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
		const role = message.guild.roles.find(role => role.name === this.config.muteRole);
		if (!victim) return discordError(this.config.missingUserArgument, message);
		if (!args[1]) return discordError(this.config.missingTimeArgument, message);
		if (!args[2]) return discordError(this.config.missingReasonArgument, message);
		if (victim.id === message.author.id) return discordError(this.config.unableToSelfMute, message)
		if (victim.highestRole.position >= message.member.highestRole.position) return discordError(this.config.userTooPowerful, message)
		if (victim.roles.has(role.id)) return discordError(this.config.alreadyMuted.replace("%u", victim), message)

		for (let duration of durations) {
			const match = new RegExp(duration, 'gmui').exec(args[1]);
			if (match) {
				const sanction = new Sanction(victim, args[2])
					.from(message.member)
					.during(Number(match[1]) * durations[duration])
					.withRole(role);
				sanctions.push(sanction);
				break;
			}
		}
			
		const success = this.config.successfullyMuted
			.replace("%u", `${victim.username}`)
			.replace("%r", args[2] || "*aucune raison spécifiée*")
			.replace("%d", duration);

		discordSuccess(success, message);

	/*	return modLog({
			color: "#ff6b61",
			member: victim,
			mod: message.author,
			action: `Mute (${args[2].toUpperCase() === 'GLOBAL' ? `global` : `aide ${args[2].toLowerCase()}`})`,
			duration: duration,
			finish: end,
			reason: args.splice(3).join(' ') || "Aucune raison spécifiée"
		}, message.guild); */

	}

}

export default Mute;