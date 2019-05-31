import Command from '../../components/Command';
import config from "../../../../config/config.json";
import math from 'mathjs';
import { discordError } from "../../components/Messages";
const parser = math.parser()

class Math extends Command {

	name = 'Mathématiques';
	shortDescription = config.messages.commands.math.shortDesc;
	longDescription = config.messages.commands.math.longDesc;
	usage = `${config.bot.prefix}math <expression mathématique de skript>`;
	examples = ['math `sqrt(12) + 18 - abs(-13)`'];
	regex = /(?:maths?|eval)/gmui;

	execute = async (message, args) => {
		let expr = args.join(' ');
		expr
			.replace(/abs\(/gimu, 'Math.abs(')
			.replace(/acos\(/gimu, 'Math.acos(')
			.replace(/asin\(/gimu, 'Math.asin(')
			.replace(/atan\(/gimu, 'Math.atan(')
			.replace(/atan2\(/gimu, 'Math.atan2(')
			.replace(/ceil\(/gimu, 'Math.ceil(')
			.replace(/cos\(/gimu, 'Math.cos(')
			.replace(/exp\(/gimu, 'Math.ceil(')
			.replace(/floor\(/gimu, 'Math.floor(')
			.replace(/ln\(/gimu, 'Math.log')
			.replace(/log\(/gimu, 'Math.log10(')
			.replace(/round\(/gimu, 'Math.round(')
			.replace(/sin\(/gimu, 'Math.sin(')
			.replace(/sqrt\(/gimu, 'Math.sqrt(')
			.replace(/tan\(/gimu, 'Math.tan(');
		expr.replace(/mod\(\s*(\d+)\s*,\s*(\d+)\s*\)/gimu, '$1 % $2');

		try {
			expr = parser.eval(expr)
		} catch(err) {
			return discordError("Impossible de tester cette expression ! Il semblerai qu'il y ai un problème dedans...", message);
		}
		message.reply(`\`${expr}\` = \`${expr}\``);
	}
};

export default Math;
