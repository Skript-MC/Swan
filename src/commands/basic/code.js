import Command from '../../components/Command';

class Code extends Command {

	constructor () {
		super('Code');
		this.regex = /(code|balise)/gmui;
		this.usage = 'code <votre code>';
		this.example = 'code broadcast "Yeah!"'
	}

	async execute(message, args) {
		message.delete()
		if ((23 + message.author.username.length + args.join(' ').length) > 2000) {
			message.channel.send(this.config.soMuchLength);
		} else {
			message.channel.send(`**Code de ${message.author.username}:**\`\`\`vb\n${args.join(' ')}\`\`\``);
		}
	}

}

export default Code;
