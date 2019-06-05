import Command from '../../components/Command';
import Discord from 'discord.js';
import { commands, client, config } from '../../main';

class Help extends Command {

	constructor () {
		super('Help');
		this.regex = /(help|aide)/gmui;
		this.usage = 'help [<la commande>]';
		this.example = 'help help';
	}

	async execute(message, args) {
		const embed = new Discord.RichEmbed()
			.setTitle('Skript-MC Bot')
			.setDescription('**Toutes les syntaxes des commandes se lisent comme une commande skript.**')
			.setColor(config.messages.colors.info)
			.setThumbnail(client.user.avatarURL)
			.setAuthor(message.author.username, client.user.avatarURL)
			.setFooter(`Executé par ${message.author.username}`, message.author.avatarURL)
		if (args.length > 0) {
			const arg = args.join(' ').toLowerCase();
			embed.setTitle('Erreur');
			embed.setDescription(config.commands.help.cmdDoesntExist);
			embed.setColor(config.messages.colors.error);
			embed.fields = [];
			for (let command of commands) {
				if ((command.name.toLowerCase() === arg) || (arg.match(command.regex))) {
					embed.setTitle(command.name);
					embed.setDescription(command.description);
					embed.setColor(config.messages.colors.info)
					embed.addField('Usage', `\`\`\`${config.bot.prefix}${command.usage}\`\`\``, false);
					embed.addField('Exemple', `\`\`\`${config.bot.prefix}${command.example}\`\`\``, false);
					if (command.permissions.length > 0) {
						embed.addField('Permissions', command.permissions.join(', '), false);
					}
					break;
				}
			}
		} else {
			for (let command of commands) {
				embed.addField(command.name, command.help, false);
			}
		}
		message.channel.send(embed);
	}

}

export default Help;