import { Message, Client } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

class Ping extends Command {

	name: string = 'Ping';
	shortDescription: string = config.messages.commands.ping.shortDesc;
	longDescription: string = config.messages.commands.ping.longDesc;
	usage: string = `${config.bot.prefix}ping`;
	examples: string[] = ['ping'];
	regex: RegExp = /(?:ping|ms)/gmui;

	execute = async (message: Message, args: string[]): Promise<void> => {
		const msg: Message = <Message> await message.channel.send("Pong !");
		msg.edit(`Pong ! La latence du bot est de ${msg.createdTimestamp - message.createdTimestamp}ms.`);
	}
};

export default Ping;
