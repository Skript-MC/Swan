import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

const roleName = config.miscellaneous.notifRoleName;

class TagNotifEvent extends Command {

	name = 'Tag Notif Évènement';
	description = config.messages.commands.tagNotifEvent.description;
	examples = ['notifEvent'];
	regex = /()?-?notif-?event/gmui;

	execute = async (message, args) => {
        message.delete();
        let role = message.guild.roles.find(r => r.name === roleName);
        if (!role.mentionable) role.setMentionable(true);
        await message.channel.send(`${role}`);
        if (role.mentionable) role.setMentionable(false);
	}
};

export default TagNotifEvent;
