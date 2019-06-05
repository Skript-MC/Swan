import Command from '../../components/Command';

class AddonPack extends Command {

	constructor () {
		super('Addon Pack');
		this.regex = /add?ons?(-|_)?pack|pack(-|_)?add?ons?/gmui;
		this.usage = 'addon-pack <votre version de serveur>';
		this.example = 'addon-pack 1.14';
	}

	async execute(message, args) {
		if (args.length > 0) {
			const match = /1\.([7-9]|1[0-4])(\.\d*)?/gimu.exec(args[0]);
			try {
				message.channel.send(this.config.messages[match[1] - 7]);
			} catch (e) {
				message.channel.send(this.config.wrongVersion);
			}
		} else {
			message.channel.send(this.config.invalidCmd)
		}
	}

}

export default AddonPack;