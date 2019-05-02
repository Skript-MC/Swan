import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import { discordError } from "../components/messages";
import { client } from "../main";

class Purge extends Command {

	name: string = 'Purge';
    shortDescription: string = config.messages.commands.purge.shortDesc;
	longDescription: string = config.messages.commands.purge.longDesc;
	usage: string = `${config.bot.prefix}purge [@mention] <nombre>`;
	examples: string[] = ['purge @utilisateur 20', 'purge 50'];
	regex: RegExp = /purge/gmui;
	channels: string[] = ['*'];
	permissions: string[] = ['Staff'];

	execute = async (message: Message, args: string[]): Promise<void> => {
        const user = message.mentions.users.first();
        let amount: number = !!parseInt(args[0]) ? parseInt(args[0]) + 1 : parseInt(args[1]) + 1

        if (!amount) return discordError(config.messages.commands.purge.missingNumberArgument, message);
        if (!amount && !user) return discordError(config.messages.commands.purge.wrongUsage, message);
        if (amount > config.miscellaneous.purgeLimit) amount = config.miscellaneous.purgeLimit;

        message.channel.fetchMessages({
            limit: amount,
        }).then((messages: any) => {
            if (user) {
                const cli: any = client;
                const filterBy = user ? user.id : cli.user.id;
                messages = messages.filter((m: any) => m.author.id === filterBy).array().slice(0, amount);
         }
        message.channel.bulkDelete(messages).catch(err => console.error(err));
        });
        
	}
};

export default Purge;
