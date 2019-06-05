import Command from '../../components/Command';
import { error, discordError } from '../../components/Messages';

class TagRole extends Command {

	constructor () {
		super('Tag Role');
		this.regex = /(tag|mention|notif)(-|_)?role/gmui;
		this.usage = 'tag-role';
		this.example = 'tagrole Notifications Évènements';
		this.permissions.push('Staff');
	}

	async execute(message, args) {
		if (args.length === 0) {
			return discordError(this.config.invalidCmd);
		} else {
			message.delete();
			let role = message.guild.roles.find(r => r.name.toUpperCase() === args.join(' ').toUpperCase());
			if (role) {
				if (!role.mentionable) {
					try {
						role.setMentionable(true);
					} catch (err) {
						error(`An error occured while attempting to set the mentionable state of role ${role} to true.\nError : ${err.msg}`);
					}
				}
				await message.channel.send(`${role}`);
				if (role.mentionable){
					try {
						role.setMentionable(false);
					} catch (err) {
						error(`An error occured while attempting to set the mentionable state of role ${role} to false.\nError : ${err.msg}`);
					}
				}
			} else {
				return error(this.config.invalidRole.replace('%s', args.join(' ')));
			}
		}
	}

}

export default TagRole;