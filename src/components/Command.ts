import { Message } from "discord.js";
import config from '../../config/config.json'

abstract class Command {
	
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

	public abstract name: string;
	public abstract shortDescription: string;
	public abstract longDescription: string;
	public abstract regex: RegExp;
	public abstract usage: string;
	public abstract examples: string[];
	//public hidden: boolean = false;
	public permissions: string[] = config.bot.default_permissions;
	public channels: string[] = config.bot.default_channels;
	public setup: Function = (): void => {};
	public abstract execute: Function = async (message: Message, args: string[]): Promise<void> => {};

}

export default Command;
