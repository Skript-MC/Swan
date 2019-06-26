import Command from '../../components/Command';
import { discordError, discordSuccess } from '../../components/Messages';
import { RichEmbed } from 'discord.js'


class Warn extends Command {

	constructor () {
		super('Warn');
		this.usage = 'warn <@mention | ID> <durée> <raison>';
		this.example = 'warn @iTrooz 5d Chut';
		this.regex = /warn/gmui;
		this.permissions.push('Staff');
	}

	async execute(message, args) {
		const victim = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
		if (!victim) return discordError(this.config.missingUserArgument, message);
		if (victim.id === message.author.id) return discordError('Ne te warn pas toi même , boulet', message);
		// if (victim.highestRole.position >= message.member.highestRole.position) return discordError(this.config.userTooPowerful, message);
		
		if(args[1]){var ra = args[1]}
		else{var ra = "Aucune définie";}

		ch.send(e);

        modLog({
			"color": "#cc3300",
			"member": victim,
			"mod": message.author,
			"action": "Avertissement",
			"reason": args.splice(2).join(" ") || "Aucune raison spécifiée"
		}, message.guild);
	}
}


export default Warn;
