import main from '../main.js';
import Config from '../../config/config.json';

const roleName = Config.Miscellaneous.notifRoleName;
const msgContent = Config.messages.notifRole.messageContent;
const emoji = "🎉";

export default {

  regex: /notifRole/gmu,
  permissions: ['Staff', 'Organisateur'],

  execute: async (message, command, args) => {
    // Vu que c'est déjà dans un channel ou faut une perm pour parler, c'est facultatif :
    // if (!message.member.hasPermission("ADD_ROLE")) return message.channel.send(":x: Vous n'avez pas la permission de faire cela !");

    message.channel.send(msgContent)
      .then(msg => {
        msg.react(emoji);
      }).catch(err => {
        console.error(err);
      });
    message.delete();
  }
};

global.doMessageReaction = async function(messageReaction, user) {
  if (messageReaction.message.content === msgContent &&
    messageReaction.message.author.bot &&
    messageReaction._emoji.name === emoji) {
    let role = messageReaction.message.guild.roles.find(r => r.name === roleName);
    if (!role) {
      try {
        role = await messageReaction.message.guild.createRole({
          name: roleName,
          permissions: [],
          mentionable: true
        });
      } catch (err) {
        console.error(`Error while attempting to create the role : ${err}`);
      }
    }
    let targetUser = await messageReaction.message.guild.fetchMember(user);
    if (!targetUser.roles.has(role.id) && !user.bot) {
      await targetUser.addRole(role);
      targetUser.send(`${messageReaction.message.guild} | :white_check_mark: Le rôle *"Notifications Evénement"* vous a été ajouté !`);
    } else if (targetUser.roles.has(role.id) && !user.bot) {
      await targetUser.removeRole(role);
      targetUser.send(`${messageReaction.message.guild} | :white_check_mark: Le rôle *"Notifications Evénement"* vous a été enlevé !`);
    }
  }
}
