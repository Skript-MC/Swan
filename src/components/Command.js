import config from '../../../config/config.json'

class Command {
	
	/**
	 * @property {string} name - Nom de la commande
	 * @property {string} description - Description de la commande
	 * @property {RegExp[]} regex - Patterns regex de la commande
	 * @property {string} utilisation - Pattern de la commande (human-readable)
	 * @property {string[]} examples - Exemples d'utilisation de la commande
	 * NOT USABLE YET @property {boolean} hidden - La commande doit-elle être cachée dans la page d'aide. Oui = cachée.
	 * @property {string[]} [permissions=config.bot.default_permissions] - Rôles requis par l'utilisateur pour
	 * executer la commande
	 * @property {string[]} [channels] - ID des channels dans lesquels la commande est utilisable
	 */

	name;
	shortDescription;
	longDescription;
	regex;
	usage;
	examples;
	module;
	//hidden = false;
	permissions = config.bot.default_permissions;
	channels = config.bot.default_channels;
	setup = () => {};
	execute = async (message, args) => {};

}

export default Command;
