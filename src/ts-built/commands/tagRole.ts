import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import { discordError } from "../components/Messages";

class TagRole extends Command {

	name: string = 'Tag Role';
	shortDescription: string = config.messages.commands.tagRole.shortDesc;
	longDescription: string = config.messages.commands.tagRole.longDesc;
	usage: string = `tag-role`;
	examples: string[] = ['tagrole Notifications Évènements'];
	regex: RegExp = /(?:tag|mention|notif)-?role/gmui;
	permissions: string[] = ['Staff'];

	execute = async (message: Message, args: string[]): Promise<void> => {
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
