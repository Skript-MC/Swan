import Command from '../../components/Command';
import config from "../../../../config/config.json";

const affirmative = ['Oui.', 'Oui !', 'D\'après moi, oui !', 'Je le pense', 'C\'est une chose sûre !', 'C\'est certain.', 'Sans aucun doutes', 'Il me semble...', 'Pourquoi demander ? La réponse parait évidente ! Oui !', 'ET C\'EST UN OUI !', 'Oui ! NAN J\'AI PERDU :sob: Je suis vraiment nul au ni-oui ni-non :weary: ', 'Affirmatif, chef.', 'Positif.'];
const negative = ['Non.', 'MDR NON', 'C\'est un non.', 'Mes sources me confirment que non.', 'C\'est mieux que tu ne sois pas au courant...', 'Bien sur que non !', 'Je ne suis pas sur de comprendre... Dans le doute je vais dire non.', 'Question très compliquée... Mais je dirai non.', 'Ou... Non ! C\'est Non !', 'Bien sur que non...', 'Négatif', 'Je répondrai par la négation. Rah chui trop fort à ni-oui ni-non ! Tu me battras jamais :wink:', 'Sûrement pas.'];

class EightBall extends Command {

	name = '8Ball';
	shortDescription = config.messages.commands.eightBall.shortDesc;
	longDescription = config.messages.commands.eightBall.longDesc;
	usage = `${config.bot.prefix}8ball `;
	examples = ['8ball suis-je le plus beau ?'];
	regex = /(?:8|eight)-?ball/gmui;

	execute = async (message, args) => {
		let answer;
		if (Math.random() < 0.5)
			answer = affirmative[Math.floor(Math.random() * affirmative.length)];
		else
			answer = negative[Math.floor(Math.random() * negative.length)];
        message.channel.send(answer);
	}
};

export default EightBall;
