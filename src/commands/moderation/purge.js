import Command from '../../components/Command';
import { discordError, error } from '../../components/Messages';

class Purge extends Command {

	constructor () {
		super('Purge');
		this.regex = /purge/gmui;
		this.usage = 'purge [<@mention>]';
		this.example = 'purge @utilisateur 20';
		this.permissions.push('Staff');
	}

	async execute(message, args) {
		const user = message.mentions.users.first();
        let amount = !!parseInt(args[0]) ? parseInt(args[0]) + 1 : parseInt(args[1]) + 1;

        if (!amount) return discordError(this.config.missingNumberArgument, message);
        if (!amount && !user) return discordError(this.config.wrongUsage, message);
        if (amount > config.miscellaneous.purgeLimit) amount = config.miscellaneous.purgeLimit;

        message.channel.fetchMessages({
            limit: amount,
        }).then((messages) => {
            if (user) {
                const cli = client;
                const filterBy = user ? user.id : cli.user.id;
                messages = messages.filter((m) => m.author.id === filterBy).array().slice(0, amount);
            }
            message.channel.bulkDelete(messages).catch(err => error(err.message));
        });
	}

}

export default Purge;