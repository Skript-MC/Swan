import { Message, GuildMember } from "discord.js";
import Command from '../components/Command';
import config from "../../../config/config.json";

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
		if (args[0] === 'asktoask')
			return message.channel.send(conf.asktoask.content);
		else if (args[0] === 'helptemplate')
			return message.channel.send(conf.helptemplate.content);
		else if (args[0] === 'internal' || args[0] === 'internalerror')
			return message.channel.send(conf.internalerror.content);
		else if (args[0] === 'deprecated' || args[0] === 'oldaddon')
			return message.channel.send(conf.deprecated.content);
		// else if (args[0] === 'opinion')
		// 	return message.channel.send({ files: [{ attachment: 'https://cdn.discordapp.com/attachments/460036535845388301/573493651112591360/img-22223753dff.jpg', name: 'opinion.jpg' }] });
		else if (args[0] === 'gui')
			return message.channel.send(conf.gui.shortContent);
		else if (args[0] === 'gui-pv') {
			await message.member.send(conf.gui.longContent1);
			return message.member.send(conf.gui.longContent2);
		} else if (args[0] === 'everyloop')
			return message.channel.send(conf.everyloop.content);
		else if (args[0] === 'longcode' || args[0] === 'code')
			return message.channel.send(conf.longcode.content);
		else if (args[0] === 'ver' || args[0] === 'version')
			return message.channel.send(conf.version.content);
		else if (args[0] === 'list' || args[0] === 'liste')
			return message.channel.send(conf.list.content);
		else
			return message.channel.send(conf.invalidMessage)
	}
};

export default AutomaticMessages;
