import Command from '../components/Command';
import config from "../../../config/config.json";
import { discordError } from "../components/Messages";

class TagRole extends Command {

	name = 'Tag Role';
	shortDescription = config.messages.commands.tagRole.shortDesc;
	longDescription = config.messages.commands.tagRole.longDesc;
	usage = `${config.bot.prefix}tag-role`;
	examples = ['tagrole Notifications Évènements'];
	regex = /(?:tag|mention|notif)-?role/gmui;
	permissions = ['Staff'];

	execute = async (message, args) => {
		if (args.length === 0) {
			return discordError(config.messages.commands.tagRole.invalidCmd, message);
		} else {
			message.delete();
			let role = message.guild.roles.find(r => r.name.toUpperCase() === args.join(' ').toUpperCase());
			if (role) {
				if (!role.mentionable) {
					try {
						role.setMentionable(true);
					} catch (err) {
						console.error(`An error occured while attempting to set the mentionable state of role ${role} to true. Error : ${err}`);
					}
				}
				await message.channel.send(`${role}`);
				if (role.mentionable){
					try {
						role.setMentionable(false);
					} catch (err) {
						console.error(`An error occured while attempting to set the mentionable state of role ${role} to false. Error : ${err}`);
					}
				}
			} else {
				return discordError(config.messages.commands.tagRole.invalidRole.replace('%s', args.join(' ')), message);
			}
		}
	}
};

export default TagRole;
