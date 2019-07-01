import Command from '../../components/Command';
import { config } from '../../main';

class ToggleNotifRole extends Command {
  constructor() {
    super('Toggle role notification');
    this.usage = 'toggle-notif-role';
    this.examples.push('toggle-notif-role');
    this.regex = /(add|give|ask|toggle|remove)(-|_)?notif(ication)?(-|_)?role/gmui;
  }

  async execute(message, _args) {
    message.delete();
    const rolename = config.miscellaneous.notifRoleName;
    let role = message.guild.roles.find(r => r.name === rolename);
    if (!role) {
      try {
        role = await message.guild.createRole({
          permissions: [],
          name: rolename,
          mentionable: false,
        });
      } catch (err) {
        console.error('Error while attempting to create the role:');
        console.error(err);
      }
    }

    if (!message.member.roles.has(role.id)) {
      await message.member.addRole(role);
      message.member.send(`**(${message.guild})** Le rôle *"${rolename}"* vous a été ajouté !`);
    } else if (message.member.roles.has(role.id)) {
      await message.member.removeRole(role);
      message.member.send(`**(${message.guild})** Le rôle *"${rolename}"* vous a été enlevé !`);
    }
  }
}

export default ToggleNotifRole;
