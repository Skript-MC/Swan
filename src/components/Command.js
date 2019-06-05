import { config } from '../main';

class Command {

	constructor (name) {
		this.config = config.commands[name.toLowerCase().replace(/\s/gmui, '_')];
		this.name = name;
		this.description = (this.config && this.config.description) ? this.config.description : `Commande ${name}`;
		this.help = (this.config && this.config.help) ? this.config.help : `Commande ${name}`;
		this.usage = (this.config && this.config.usage) ? this.config.usage : name.toLowerCase().replace(/\s/gmui, '_');
		this.example = (this.config && this.config.example) ? this.config.example : name.toLowerCase().replace(/\s/gmui, '_');
		this.regex = (this.config && this.config.regex) ? this.config.regex : new RegExp(name, 'gmui');
		this.permissions = (this.config && this.config.permissions) ? this.config.permissions : [];
		this.allowedChannels = (this.config && this.config.allowedChannels) ? this.config.allowedChannels : [];
		this.denyChannels = (this.config && this.config.description) ? this.config.description :  [];
		for (let channel of config.bot.default_channels) {
			this.allowedChannels.push(channel);
		}
	}

	async init (message, args) {};
	async execute (message, args) {};

}

export default Command;