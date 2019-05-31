import Command from '../../components/Command';
import config from "../../../../config/config.json";
import { discordError } from "../../components/messages";
import { client } from "../../main";

class Purge extends Command {

	name = 'Purge';
    shortDescription = config.messages.commands.purge.shortDesc;
	longDescription = config.messages.commands.purge.longDesc;
	usage = `${config.bot.prefix}purge [@mention] `;
	examples = ['purge @utilisateur 20', 'purge 50'];
	regex = /purge/gmui;
	channels = ['*'];
	permissions = ['Staff'];

	execute = async (message, args) => {
        const user = message.mentions.users.first();
        let amount = !!parseInt(args[0]) ? parseInt(args[0]) + 1 : parseInt(args[1]) + 1

        if (!amount) return discordError(config.messages.commands.purge.missingNumberArgument, message);
        if (!amount && !user) return discordError(config.messages.commands.purge.wrongUsage, message);
        if (amount > config.miscellaneous.purgeLimit) amount = config.miscellaneous.purgeLimit;

        message.channel.fetchMessages({
            limit: amount,
        }).then((messages) => {
            if (user) {
                const cli = client;
                const filterBy = user ? user.id : cli.user.id;
                messages = messages.filter((m) => m.author.id === filterBy).array().slice(0, amount);
            }
            message.channel.bulkDelete(messages).catch(err => console.error(err));
        });
        
	}
};

export default Purge;
