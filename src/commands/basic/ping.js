import Command from '../../components/Command';

class Ping extends Command {

	constructor () {
		super('Ping');
		this.regex = /(ping|ms)/gmui;
	}

	async execute(message, args) {
		const msg = await message.channel.send('Ping !');
		msg.edit(`Pong ! La latence du bot est de ${msg.createdTimestamp - message.createdTimestamp}ms.`);
	}

}

export default Ping;