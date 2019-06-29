import { loadBot, loadCommands, loadSkriptHubAPI, loadSkripttoolsAPI } from './setup';
import { success, discordError } from './components/Messages';

export const config = require(`${__dirname}/../config/config.json`);
export const pkg = require(`${__dirname}/../package.json`);
export const client = loadBot();
export const SkriptHubSyntaxes = loadSkriptHubAPI();
export const SkripttoolsAPI = loadSkripttoolsAPI();

export const commands = [];
export const sanctions = [];

async function start() {

	loadCommands();
	client.on('ready', () => {
		client.user.setActivity('.aide | Skript-MC', {type: 'WATCHING'});
		setInterval(() => {
			for (let sanction of sanctions) {
				sanction.time--;
				if (sanction.time === 0) {
					if (sanction.role) sanction.victim.removeRole(sanction.role);
				}
			}
		}, 1000);
	   success('Skript-MC bot loaded!');
	});

	client.on('message', (message) => {
		if (message.author.bot) return;
		if (message.system) return; // Message envoyé par discord. ex: quand on pin un message
		const args = message.content.split(' ');
		const cmd = args.shift();
		for (let command of commands) {
			const regex = new RegExp(`^\\${config.bot.prefix}${command.regex.source}`, command.regex.flags);
			if (cmd.match(regex)) {
				if (command.permissions.length > 0) {
					const hasRole = message.member.roles.filter(role => command.permissions.includes(role));
					if (!hasRole) {
						discordError('Vous n\'avez pas la permission d\'executer cette commande !', message);
						return;
					}
				} else if (command.allowedChannels.length > 0) {
					const isAllowed = command.allowedChannels.includes(message.channel.id);
					if (!isAllowed) return;
				} else if (command.denyChannels.length > 0) {
					const isDeny = command.denyChannels.includes(message.channel.id);
					if (isDeny) return;
				}
				command.execute(message, args);
			}
		}
	});

}

start();
