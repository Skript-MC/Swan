import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import { discordError } from "../components/messages";
import { client } from "../main";

class Purge extends Command {

	name: string = 'Purge';
	description: string = config.messages.commands.purge.description;
	examples: string[] = ['purge @utilisateur 20', 'purge 50'];
	regex: RegExp = /purge/gmui;
	channels: string[] = ['*'];

	execute = async (message: Message, args: string[]): Promise<void> => {
        const user = message.mentions.users.first();
        const amount: number = !!parseInt(args[0]) ? parseInt(args[0]) + 1 : parseInt(args[1]) + 1

        if (!amount) return discordError(config.messages.commands.purge.missingNumberArgument, message);
        if (!amount && !user) return discordError(config.messages.commands.purge.wrongUsage, message);

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
