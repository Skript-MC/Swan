import Discord, { Message, Role, GuildMember } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

const roleName = config.miscellaneous.notifRoleName;

class AddNotifRole extends Command {

	name: string = 'Ajout role notification';
	description: string = config.messages.commands.addNotifRole.description;
	examples: string[] = ['add-notif-role', 'toggle-notif-role'];
	regex: RegExp = /(?:add|give|ask|toggle)-?notif(?:ication)?-?role/gmui;

	execute = async (message: Message, args: string[]): Promise<void> => {
		message.delete();
		let role: Role = message.guild.roles.find(r => r.name === roleName),
			targetUser: GuildMember = await message.guild.fetchMember(message.author);

		if (!role) {
			try {
				role = await message.guild.createRole({
					permissions: [],
					name: roleName,
					mentionable: false
				});
			} catch (err) {
				console.error(`Error while attempting to create the role : ${err}`);
			}
		}

		if (!targetUser.roles.has(role.id)) {
			await targetUser.addRole(role);
			targetUser.send(`${message.guild} | :white_check_mark: Le rôle *"${config.miscellaneous.notifRoleName}"* vous a été ajouté !`);
		} else if (targetUser.roles.has(role.id)) {
			await targetUser.removeRole(role);
			targetUser.send(`${message.guild} | :white_check_mark: Le rôle *"${config.miscellaneous.notifRoleName}"* vous a été enlevé !`);
		}
	}
};

export default AddNotifRole;
