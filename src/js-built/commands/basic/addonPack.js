import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { discordError } from "../../components/Messages";

const conf = config.messages.commands.addonPack;

class AddonPack extends Command {

	name = 'Pack d\'addon';
	shortDescription = conf.shortDesc;
	longDescription = conf.longDesc;
	usage = `${config.bot.prefix}addon-pack <version MC>`;
	examples = ['addon-pack 1.13.2', 'addon-pack 1.10.2'];
	regex = /add?ons?-?pack/gimu;

	execute = async (message, args) => {
		if (args.length > 0 && args[0].match(/1\.(7|8|9|10|11|12|13|14)(?:\.\d*)?/gimu)) {
			const arg = args[0].slice(2);
			if (arg.includes("7")) {
				return message.channel.send(conf.messages[0]);
			} else if (arg.includes("8")) {
				return message.channel.send(conf.messages[1]);
			} else if (arg.includes("9")) {
				return message.channel.send(conf.messages[2]);
			} else if (arg.includes("10")) {
				return message.channel.send(conf.messages[3]);
			} else if (arg.includes("11")) {
				return message.channel.send(conf.messages[4]);
			} else if (arg.includes("12")) {
				return message.channel.send(conf.messages[5]);
			} else if (arg.includes("13")) {
				return message.channel.send(conf.messages[6]);
			} else if (arg.includes("14")) {
				return message.channel.send(conf.messages[7]);
			}
		} else {
			return discordError(config.messages.commands.addonPack.invalidCmd, message)
		}
	}
};

export default AddonPack;
