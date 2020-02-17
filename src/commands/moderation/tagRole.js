import Command from '../../helpers/Command';
import { discordError } from '../../helpers/messages';

class TagRole extends Command {
  constructor() {
    super('Tag Role');
    this.aliases = ['tagrole', 'tag-role', 'tag_role'];
    this.usage = 'tag-role <rôle>';
    this.examples = ['tagrole Notifications Évènements'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.send(discordError(this.config.invalidCmd, message));

    message.delete();
    const role = message.guild.roles.cache.find(r => r.name.toUpperCase() === args.join(' ').toUpperCase());
    if (role) {
      if (!role.mentionable) {
        try {
          role.setMentionable(true);
        } catch (err) {
          console.error(`An error occured while attempting to set the mentionable state of role ${role} to true.\nError : ${err.msg}`);
        }
      }
      await message.channel.send(`${role.toString()} :arrow_up: `);
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
