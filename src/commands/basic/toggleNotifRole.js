import Command from '../../components/Command';
import Setup from '../../setup';
import { error } from '../../components/Messages';

class ToggleNotifRole extends Command {

	constructor () {
		super('Toggle role notification');
		this.regex = /(add|give|ask|toggle|remove)(-|_)?notif(ication)?(-|_)?role/gmui;
	}

	async execute(message, args) {
		message.delete();
		let role = message.guild.roles.find(r => r.name === this.config.roleName);
		if (!role) {
			try {
				role = await message.guild.createRole({
					permissions: [],
					name: this.config.roleName,
					mentionable: false
				});
			} catch (err) {
				error(`Error while attempting to create the role : ${err.message}`)
			}
		}

		if (!message.member.roles.has(role.id)) {
			await message.member.addRole(role);
			message.member.send(`${message.guild} | :white_check_mark: Le rôle *"${Setup.config.miscellaneous.notifRoleName}"* vous a été ajouté !`);
		} else if (message.member.roles.has(role.id)) {
			await message.member.removeRole(role);
			message.member.send(`${message.guild} | :white_check_mark: Le rôle *"${Setup.config.miscellaneous.notifRoleName}"* vous a été enlevé !`);
		}
	}

}

export default ToggleNotifRole;