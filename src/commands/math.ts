import { Message } from "discord.js";
import Command from '../components/Command';
import config from "../../config/config.json";
import math from 'mathjs';
import { discordError } from "../components/Messages";
const parser = math.parser()

class Math extends Command {

	name: string = 'Mathématiques';
	shortDescription: string = config.messages.commands.math.shortDesc;
	longDescription: string = config.messages.commands.math.longDesc;
	usage: string = `${config.bot.prefix}math <expression mathématique de skript>`;
	examples: string[] = ['math `sqrt(12) + 18 - abs(-13)`'];
	regex: RegExp = /(?:maths?|eval)/gmui;

	execute = async (message: Message, args: string[]): Promise<void> => {
		let expr: string = args.join(' ');
		expr
			.replace(/abs/gimu, 'Math.abs')
			.replace(/acos/gimu, 'Math.acos')
			.replace(/asin/gimu, 'Math.asin')
			.replace(/atan\(/gimu, 'Math.atan(')
			.replace(/atan2\(/gimu, 'Math.atan2(')
			.replace(/ceil/gimu, 'Math.ceil')
			.replace(/cos/gimu, 'Math.cos')
			.replace(/exp\(/gimu, 'Math.ceil(')
			.replace(/floor/gimu, 'Math.floor')
			.replace(/ln/gimu, 'Math.log')
			.replace(/log/gimu, 'Math.log10')
			.replace(/round/gimu, 'Math.round')
			.replace(/sin/gimu, 'Math.sin')
			.replace(/sqrt/gimu, 'Math.sqrt')
			.replace(/tan/gimu, 'Math.tan');
		expr.replace(/mod\((\d+),\s*(\d+)\)/, '$1 % $2');

		try {
			expr = parser.eval(expr)
		} catch(err) {
			return discordError("Il semblerai qu'il y ai un problème dans ton expression...", message);
		}
		message.reply(`\`${expr}\` = \`${expr}\``);
	}
};

export default Math;
