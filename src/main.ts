import { loadCommands, loadDiscord, loadSkriptHubAPI } from './setup';
import { Client } from 'discord.js';
import { error } from './components/messages';
import Command from './components/Command';
import { success } from './components/Messages';
import config from '../config/config.json';

export const commands: Promise<Command[]> = <Promise<Command[]>> loadCommands().catch(err => error(err));
export const SkriptHubSyntaxes: Promise<any[]> = <Promise<any[]>> loadSkriptHubAPI().catch(err => error(err));
export const client: Promise<void | Client> = loadDiscord()
	.catch(err => {
		if (err.match(/is not a constructor/gmui)) {
			error(`You didn't export your command! (real error: ${err})`)
		}
	});

client.then(client => {

	const discord: Client = <Client> client;

	discord.on('ready', () => {
		discord.user.setActivity('.aide | Skript-Mc', {type: 'WATCHING'});
		success('SkriptMc bot loaded!');
	})

	discord.on('message', message => {
		
		if (message.author.bot) return;

		commands.then(cmds => {

			const commands: Command[] = <Command[]> cmds;
			for (let command of commands) {
				const regex: RegExp = new RegExp(`^\\${config.bot.prefix}${command.regex.source}`, command.regex.flags);

				if (message.content.match(regex)) {
					if ((!command.channels) || (!command.channels.includes(message.channel.id)) && !command.channels.includes('*')) {
						return;
					}
					if (command.permissions && command.permissions.length > 0) {
						for (let permission of command.permissions) {
							if (message.member.roles.find(role => role.name === permission)) {
								command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
								break;
							}
						}
					} else {
						command.execute(message, message.content.split(' ').splice(1, message.content.split(' ').length));
					}
				}
			}
		});
	});
	discord.on('error', console.error);
});
