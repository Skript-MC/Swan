import Command from '../../components/Command';
import config from "../../../../config/config.json";

const roleName = config.miscellaneous.notifRoleName;

class ToggleNotifRole extends Command {

	name = 'Toggle role notification';
	shortDescription = config.messages.commands.addNotifRole.shortDesc;
	longDescription = config.messages.commands.addNotifRole.longDesc;
	usage = `${config.bot.prefix}toggle-notif-role`;
	examples = ['toggle-notif-role'];
	regex = /(?:add|give|ask|toggle)-?notif(?:ication)?-?role/gmui;

	execute = async (message, args) => {
		message.delete();
		let role = message.guild.roles.find(r => r.name === roleName);
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

		if (!message.member.roles.has(role.id)) {
			await message.member.addRole(role);
			message.member.send(`${message.guild} | :white_check_mark: Le rôle *"${config.miscellaneous.notifRoleName}"* vous a été ajouté !`);
		} else if (message.member.roles.has(role.id)) {
			await message.member.removeRole(role);
			message.member.send(`${message.guild} | :white_check_mark: Le rôle *"${config.miscellaneous.notifRoleName}"* vous a été enlevé !`);
		}
	}
};

export default ToggleNotifRole;
