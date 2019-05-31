import Command from '../../components/Command';
import config from "../../../../config/config.json";

class Ping extends Command {

	name = 'Ping';
	shortDescription = config.messages.commands.ping.shortDesc;
	longDescription = config.messages.commands.ping.longDesc;
	usage = `${config.bot.prefix}ping`;
	examples = ['ping'];
	regex = /(?:ping|ms)/gmui;

	execute = async (message, args) => {
		const msg = await message.channel.send("Pong !");
		msg.edit(`Pong ! La latence du bot est de ${msg.createdTimestamp - message.createdTimestamp}ms.`);
	}
};

export default Ping;
