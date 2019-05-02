import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

const conf: any = config.messages.commands.auto.commands;

class AutomaticMessages extends Command {

	name: string = 'Messages automatiques';
	shortDescription: string = config.messages.commands.auto.shortDesc;
	longDescription: string = config.messages.commands.auto.longDesc;
	usage: string = `${config.bot.prefix}auto <message>`;
	examples: string[] = ['auto asktoask'];
	channels: string[] = ['*'];
	regex: RegExp = /auto(?:mati(?:que|c))?-?(?:messages?)?/gmui;

	execute = async (message: Message, args: string[]): Promise<void> => {
		if (args[0] === 'asktoask')
			message.channel.send(conf.asktoask.content);
		else if (args[0] === 'helptemplate')
			message.channel.send(conf.helptemplate.content);
		else if (args[0] === 'internal' || args[0] === 'internalerror')
			message.channel.send(conf.internalerror.content);
		else if (args[0] === 'deprecated' || args[0] === 'oldaddon')
			message.channel.send(conf.deprecated.content);
		else if (args[0] === 'opinion')
			message.channel.send({ files: [{ attachment: 'https://cdn.discordapp.com/attachments/460036535845388301/573493651112591360/img-22223753dff.jpg', name: 'opinion.jpg' }] });
		else
			message.channel.send(conf.invalidMessage)
	}
};

export default AutomaticMessages;
