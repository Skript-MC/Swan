import Command from '../../structures/Command';

class TagRole extends Command {
  constructor() {
    super('Tag Role');
    this.aliases = ['tagrole', 'tag-role', 'tag_role'];
    this.usage = 'tag-role <rôle>';
    this.examples = ['tagrole Notifications Évènements'];
    this.permissions = ['Staff'];
  }

  async execute(client, message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.invalidCmd, message.member);

    message.delete();
    const role = message.guild.roles.cache.find(r => r.name.toUpperCase() === args.join(' ').toUpperCase());
    if (role) {
      if (!role.mentionable) {
        try {
          role.setMentionable(true);
        } catch (err) {
          client.logger.error(`An error occured while attempting to set the mentionable state of role ${role} to true.\nError : ${err.msg}`);
        }
      }
      await message.channel.send(`${role.toString()} :arrow_up: `);
      if (role.mentionable) {
        try {
          role.setMentionable(false);
        } catch (err) {
          client.logger.error(`An error occured while attempting to set the mentionable state of role ${role} to false.\nError : ${err.msg}`);
        }
      }
    } else {
      return client.logger.error(this.config.invalidRole.replace('%s', args.join(' ')));
    }
  }
}

export default TagRole;
