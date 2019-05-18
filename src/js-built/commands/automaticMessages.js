import Command from '../components/Command';
import config from "../../../config/config.json";
import { discordError } from '../components/Messages';

const conf = config.messages.commands.auto.commands;

class AutomaticMessages extends Command {

	name = 'Messages automatiques';
	shortDescription = config.messages.commands.auto.shortDesc;
	longDescription = config.messages.commands.auto.longDesc;
	usage = `${config.bot.prefix}auto `;
	examples = ['auto asktoask'];
	channels = ['*'];
	regex = /auto(?:mati(?:que|c))?-?(?:messages?)?/gmui;

	execute = async (message, args) => {
		const arg = args[0];
		if (!args[0])
			return discordError(config.messages.commands.auto.noArg.replace('%s', `${Object.keys(config.messages.commands.auto.commands).join(', ')}`), message);
		
		if (arg.match(/asktoask/gimu))
			return message.channel.send(conf.asktoask.content);
		else if (arg.match(/helptemplate/gimu))
			return message.channel.send(conf.helptemplate.content);
		else if (arg.match(/internal(?:error)?/gimu))
			return message.channel.send(conf.internalerror.content);
		else if (arg.match(/(?:deprecated|oldaddon)/gimu))
			return message.channel.send(conf.deprecated.content);
		else if (arg.match(/gui-pv/gimu)) {
			message.react('✅');
			await message.member.send(conf.gui.longContent1);
			return message.member.send(conf.gui.longContent2);
		} else if (arg.match(/gui/gimu))
			return message.channel.send(conf.gui.shortContent);
		else if (arg.match(/everyloop/gimu))
			return message.channel.send(conf.everyloop.content);
		else if (arg.match(/(?:long)?code/gimu))
			return message.channel.send(conf.longcode.content);
		else if (arg.match(/ver(?:sion)?/gimu))
			return message.channel.send(conf.version.content);
		else if (arg.match(/ya?ml/gimu))
			return message.channel.send(conf.yaml.content);
		else if (arg.match(/list-pv/gimu)) {
			message.react('✅');
			return message.member.send(conf.list.pvContent);
		} else if (arg.match(/liste?/gimu))
			return message.channel.send(conf.list.content);
		// else if (arg.match(/opinion/gimu))
		// return message.channel.send({ files: [{ attachment: 'https://cdn.discordapp.com/attachments/460036535845388301/573493651112591360/img-22223753dff.jpg', name: 'opinion.jpg' }] });
		else
			return discordError(conf.invalidMessage, message);
	}
};

export default AutomaticMessages;
