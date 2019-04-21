/* eslint-disable sort-keys */
/* eslint-disable no-console */
/* eslint-disable max-statements */

import Config from '../../config/config.json';

const roleName = Config.miscellaneous.notifRoleName,
		msgContent = Config.messages.notifRole.messageContent,
		emoji = "🎉";

export default {

	title: "Notif role",
	description: "Créer le message permettant de s'ajouter le rôle \"Notifications Événement\".",
	example: "notifrole",
	regex: /notif-?[Rr]ole/mu,
	permissions: ['Staff', 'Organisateur'],

	execute: async message => {

		/*
		 * Vu que c'est déjà dans un channel ou faut une perm pour parler, c'est facultatif :
		 * if (!message.member.hasPermission("ADD_ROLE")) return message.channel.send(":x: Vous n'avez pas la permission de faire cela !");
		 */

		message.channel.send(msgContent)
			.then(m => {
				m.react(emoji);
			})
			.catch(err => {
				console.error(err);
			});
		message.delete();
	},

	doMessageReaction: async (messageReaction, user) => {
		if (messageReaction.message.content === msgContent &&
			messageReaction.message.author.bot &&
			messageReaction.emoji.name === emoji) {

			let role = messageReaction.message.guild.roles.find(r => r.name === roleName),
				targetUser = await messageReaction.message.guild.fetchMember(user);

			if (!role) {
				try {
					role = await messageReaction.message.guild.createRole({
						permissions: [],
						name: roleName,
						mentionable: true
					});
				} catch (err) {
					// eslint-disable-next-line no-console
					console.error(`Error while attempting to create the role : ${err}`);
				}
			}

      if (!targetUser.roles.has(role.id)) {
				await targetUser.addRole(role);
				targetUser.send(`${messageReaction.message.guild} | :white_check_mark: Le rôle *"${Config.miscellaneous.notifRoleName}"* vous a été ajouté !`);
			} else if (targetUser.roles.has(role.id)) {
				await targetUser.removeRole(role);
				targetUser.send(`${messageReaction.message.guild} | :white_check_mark: Le rôle *"${Config.miscellaneous.notifRoleName}"* vous a été enlevé !`);
			}
		}
	}
};
