import { loadCommands, loadDiscord, loadSkripttoolsAPI, loadSkriptHubAPI } from './setup';
import { Client, GuildMember } from 'discord.js';
import { error, info } from './components/messages';
import Command from './components/Command';
import { success } from './components/Messages';
import config from '../config/config.json';

export const commands: Promise<Command[]> = <Promise<Command[]>> loadCommands().catch(err => error(err));
export let SkripttoolsSyntaxes: Promise<any[]> = <Promise<any[]>> loadSkripttoolsAPI().catch(err => error(err));
export let SkriptHubSyntaxes: Promise<any[]> = <Promise<any[]>> loadSkriptHubAPI().catch(err => error(err));
export const client: Promise<void | Client> = <Promise<Client>> loadDiscord()
	.catch(err => {
		if (err.match(/is not a constructor/gmui)) {
			error(`You didn't export your command! (real error: ${err})`)
		}
	});
export let test: number = 1;

client.then(client => {

	const discord: Client = <Client> client;

	discord.on('ready', () => {
		discord.user.setActivity('.aide | Skript-Mc', {type: 'WATCHING'});
		success('SkriptMc bot loaded!');

		// Met à jour les APIs (tous les jours à 05h00)
		setInterval(() => {
			const now: Date = new Date(Date.now());
			if (now.getHours() === 5 && now.getMinutes() === 0) {
				info("5h00 : Reloading APIs...");
				SkripttoolsSyntaxes = <Promise<any[]>> loadSkripttoolsAPI().catch(err => error(err));
				SkriptHubSyntaxes = <Promise<any[]>> loadSkriptHubAPI().catch(err => error(err));
			}
		}, 60000);
	})

	discord.on('message', async message => {
		
		if (message.author.bot) return;
		if (message.system) return; // Message envoyé par discord. ex: quand on pin un message
		if (message.channel.id === config.miscellaneous.ideaChannelId)
			message.react('✅').then(() => message.react('❌'));

		if (message.channel.id === config.miscellaneous.snippetChannelId && !message.member.roles.find(r => r.name === "Staff")) {
			// On vérifie que ce ne soit pas lui qui ai posté le dernier message... Si jamais il dépasse les 2k charactères, ou qu'il veut apporter des précisions par exemple.
			const previousAuthorId: string = await message.channel.fetchMessages({ before: message.channel.lastMessageID, limit: 1 }).then(elt => elt.first().author.id);
			if (previousAuthorId !== message.author.id && !message.content.match(/```(?:(?:.+|\n))*```/gimu)) {
				message.delete();
				message.member.send(`Merci d'éviter le spam dans ${message.channel}. Votre message ne contient pas de blocs de code... Comment voulez vous partager du code sans bloc de code ?? Si vous ne savez simplement pas faire de bloc de codes, regardez ici : <https://support.discordapp.com/hc/fr/articles/210298617>`);
			}
		}

		commands.then(cmds => {

			const commands: Command[] = <Command[]> cmds;
			for (let command of commands) {
				const regex: RegExp = new RegExp(`^\\${config.bot.prefix}${command.regex.source}`, command.regex.flags);

				if (message.content.match(regex)) {
					if (!command.channels || (!command.channels.includes(message.channel.id)) && !command.channels.includes('*')) {
						return;
					} else if (config.bot.forbidden_channels.includes(message.channel.id)) {
						return message.delete();
					} else if (command.permissions && command.permissions.length > 0) {
						for (let permission of command.permissions) {
							if (message.member.roles.find(role => role.name === permission)) {
								command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
								break;
							}
						}
					} else
						command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
						break;
					}
			}
		});
	});
	discord.on('error', console.error);
});
