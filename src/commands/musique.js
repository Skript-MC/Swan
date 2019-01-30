import Discord from 'discord.js';
import Config from '../../config/config.json';

export default {

	regex: 'test',

	execute: async message => {
		console.log(message)
		return message.channel.send("ezze");
	}

}
