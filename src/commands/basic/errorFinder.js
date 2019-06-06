import Command from '../../components/Command';
import Discord from 'discord.js';
import Setup from '../../setup';

class ErrorFinder extends Command {

	constructor () {
		super('Error Finder');
		this.regex = /(find(_|-)?my(_|-)?err(or)?|trouve(_|-)?mon(_|-)?err(eure?)?)/gmui;
		this.usage = 'findmyerror <votre erreur>';
		this.example = "findmyerror Can't compare 'if arg 1' with a text";
	}

	async execute(message, args) {
		const arg = args.join(' ').toLowerCase();
		const embed = new Discord.RichEmbed()
			.setAuthor('Trouve mon erreur', Setup.client.user.avatarURL)
			.setColor(Setup.config.messages.colors.success)
			.setFooter(`Executé par ${message.author.username}`, message.author.avatarURL)
			.setTimestamp(new Date());
		if (arg.match(/indentation/gmui)) {
			embed.setDescription(this.config.messages.indentation);
		} else if (arg.match(/can't understand this/gmui)) {
			embed.setDescription(this.config.messages.cantunderstand);
		} else if (arg.match(/empty configuration section/gmui)) {
			embed.setDescription(this.config.messages.emptysection);
		} else if (arg.match(/invalid use of quotes/gmui)) {
			embed.setDescription(this.config.messages.invalidquotes);
		} else if (arg.match(/there's no loop that match/gmui)) {
			embed.setDescription(this.config.messages.noloopmatch);
		} else if (arg.match(/"else" has to be place just after an "if"/gmui)) {
			embed.setDescription(this.config.messages.elseafterif);
		} else if (arg.match(/can't compare/gmui)) {
			embed.setDescription(this.config.messages.cantcompare);
		} else if (arg.match(/is not a valid item data/gmui)) {
			embed.setDescription(this.config.messages.notvaliditemdata);
		} else if (arg.match(/can't be added to/gmui)) {
			embed.setDescription(this.config.messages.cantbeadded);
		} else {
			embed.setColor(Setup.config.messages.colors.error);
		}

		if (embed.color === Setup.config.messages.colors.error) {
			embed.setDescription(this.config.messages.other);
		} else {
			embed.setDescription(`**__Nous avons trouvé votre erreur mais:__**\n\n${this.config.messages.other}`);
		}
		
		message.channel.send(embed);
	}

}

export default ErrorFinder;