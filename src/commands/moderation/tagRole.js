import Command from '../../components/Command';
import { discordError } from '../../components/Messages';

class TagRole extends Command {
  constructor() {
    super('Tag Role');
    this.regex = /(tag|mention|notif)(-|_)?role/gmui;
    this.usage = 'tag-role <rôle>';
    this.examples.push('tagrole Notifications Évènements');
    this.permissions.push('Staff');
  }

  async execute(message, args) {
    if (args.length === 0) return discordError(this.config.invalidCmd);

    message.delete();
    const role = message.guild.roles.find(r => r.name.toUpperCase() === args.join(' ').toUpperCase());
    if (role) {
      if (!role.mentionable) {
        try {
          role.setMentionable(true);
        } catch (err) {
          console.error(`An error occured while attempting to set the mentionable state of role ${role} to true.\nError : ${err.msg}`);
        }
      }
      await message.channel.send(`${role} :arrow_up: `);
      if (role.mentionable) {
        try {
          role.setMentionable(false);
        } catch (err) {
          console.error(`An error occured while attempting to set the mentionable state of role ${role} to false.\nError : ${err.msg}`);
        }
      }
    } else {
      return console.error(this.config.invalidRole.replace('%s', args.join(' ')));
    }
  }
}

export default TagRole;
