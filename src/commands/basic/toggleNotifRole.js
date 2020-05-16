import Command from '../../structures/Command';

class ToggleNotifRole extends Command {
  constructor() {
    super('Toggle role notification');
    this.aliases = ['toggle-notif-role', 'togglenotifrole', 'toggle_notif_role'];
    this.usage = 'toggle-notif-role';
    this.examples = ['toggle-notif-role'];
    this.enabledInHelpChannels = false;
  }

  async execute(client, message, _args) {
    message.delete();
    const role = message.guild.roles.resolve(client.config.roles.eventNotifications);
    if (!role) {
      client.logger.warn('Le rôle "Notification Évènement" n\'existe pas !');
      return message.channel.send("Désolé, mais ce rôle n'a pas été créé. Signalez cela à un modérateur discord");
    }

    if (!message.member.roles.cache.has(role.id)) {
      try {
        await message.member.roles.add(role);
      } catch (e) {
        message.channel.send(client.config.messages.errors.rolePermissions);
        client.logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
      }
      message.member.send(`**(${message.guild.name})** Le rôle *"${role.name}"* vous a été ajouté !`).catch(() => {});
    } else if (message.member.roles.cache.has(role.id)) {
      try {
        await message.member.roles.remove(role);
      } catch (e) {
        message.channel.send(client.config.messages.errors.rolePermissions);
        client.logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
      }
      message.member.send(`**(${message.guild.name})** Le rôle *"${role.name}"* vous a été enlevé !`).catch(() => {});
    }
  }
}

export default ToggleNotifRole;
