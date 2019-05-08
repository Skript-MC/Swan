import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import { discordError } from "../components/Messages";

const conf: any = config.messages.commands.addonPack;
const versions: string[] = ['7', '8', '9', '10', '11', '12', '13', '14'];

class AddonPack extends Command {

	name: string = 'Pack d\'addon';
	shortDescription: string = conf.shortDesc;
	longDescription: string = conf.longDesc;
	usage: string = `addon-pack <version MC>`;
	examples: string[] = ['addon-pack 1.13.2', 'addon-pack 1.10.2'];
	regex: RegExp = /add?ons?-?pack/gimu;

	execute = async (message: Message, args: string[]): Promise<void> => {
		if (args.length > 0 && args[0].match(/1\.(7|8|9|10|11|12|13|14)(?:\.\d*)?/gimu)) {
			const arg: string = args[0].slice(2);
			for (let i = 0; i < versions.length; i++) {
				if (arg.includes(versions[i])) {
					message.channel.send(conf.messages[i]);
					break;
				}
			}
		} else {
			discordError(config.messages.commands.addonPack.invalidCmd, message)
		}
	}
};

export default AddonPack;
