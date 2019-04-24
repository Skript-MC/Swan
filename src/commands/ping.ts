import { Message, Client } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

class Ping extends Command {

	name: string = 'Ping';
	description: string = config.messages.commands.tagNotifEvent.description;
	examples: string[] = ['ping'];
	regex: RegExp = /(?:ping|ms)/gmui;

	execute = async (message: Message, args: string[]): Promise<void> => {
		const msg: Message = <Message> await message.channel.send("Ping");
		msg.edit(`Pong ! La latence du bot est de ${msg.createdTimestamp - message.createdTimestamp}ms.`);
	}
};

export default Ping;
