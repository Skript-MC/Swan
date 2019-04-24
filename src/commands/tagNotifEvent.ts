import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

const roleName = config.miscellaneous.notifRoleName;

class TagNotifEvent extends Command {

	name: string = 'Tag Notif Évènement';
	description: string = config.messages.commands.tagNotifEvent.description;
	examples: string[] = ['notifEvent'];
	regex: RegExp = /(?:tag)?-?notif-?event/gmui;

	execute = async (message: Message, args: string[]): Promise<void> => {
        message.delete();
        let role = message.guild.roles.find(r => r.name === roleName);
        if (!role.mentionable) role.setMentionable(true);
        await message.channel.send(`${role}`);
        if (role.mentionable) role.setMentionable(false);
	}
};

export default TagNotifEvent;
