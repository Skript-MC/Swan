import { Message, Client } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";

class Ping extends Command {

	name = 'Ping';
	description = config.messages.commands.tagNotifEvent.description;
	examples = ['ping'];
	regex = /(|ms)/gmui;

	execute = async (message, args) => {
		const msg = await message.channel.send("Pong !");
		msg.edit(`Pong ! La latence du bot est de ${msg.createdTimestamp - message.createdTimestamp}ms.`);
	}
};

export default Ping;
