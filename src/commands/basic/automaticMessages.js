import Command from '../../components/Command';
import { discordError } from '../../components/Messages';

class AutomaticMessages extends Command {

	constructor () {
		super('Automatic Messages');
		this.regex = /auto(mati(que|c))?(-|_)?(messages?|msg)/gmui;
		this.usage = 'automsg <nom du message>';
		this.example = 'automsg asktoask';
	}

	async execute(message, args) {
		const arg = args.join(' ');
		if (args.length === 0) return new Message(this.config.noArg.replace('%s', `\n - ${Object.keys(this.config.messages).join('\n - ')}\n`)).as('error').from(message).toDiscord();
		if (arg.match(/ask\s?to\s?ask/gimu)) message.channel.send(this.config.messages.asktoask.content);
		else if (arg.match(/help\s?template/gimu)) message.channel.send(this.config.messages.helptemplate.content);
		else if (arg.match(/internal\s?(error)?/gimu)) message.channel.send(this.config.messages.internalerror.content);
		else if (arg.match(/(deprecated|old\s?addon)/gimu)) message.channel.send(this.config.messages.deprecated.content);
		else if (arg.match(/gui-pv/gimu)) {
			message.react('✅');
            await message.member.send(this.config.messages.gui.longContent1);
            message.member.send(this.config.messages.gui.longContent2);
		} else if (arg.match(/gui/gimu)) message.channel.send(this.config.messages.gui.shortContent);
		else if (arg.match(/every\s?loop/gimu)) message.channel.send(this.config.messages.everyloop.content);
		else if (arg.match(/(long)?code/gimu)) message.channel.send(this.config.messages.longcode.content);
		else if (arg.match(/ver(sion)?/gimu)) message.channel.send(this.config.messages.version.content);
		else if (arg.match(/ya?ml/gimu)) message.channel.send(this.config.messages.yaml.content);
		else if (arg.match(/list-pv/gimu)) {
			message.react('✅'); message.member.send(this.config.messages.list.pvContent);
        } else if (arg.match(/liste?/gimu)) message.channel.send(this.config.messages.list.content);
        else discordError(this.config.invalidMessage, message);
	}

}

export default AutomaticMessages;