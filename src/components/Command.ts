import { Message } from "discord.js";
import config from '../../config/config.json'

abstract class Command {

	public abstract name: string;
	public abstract description: string;
	public abstract regex: RegExp;
	public abstract examples: string[];
	public permissions: string[] = config.bot.default_permissions;
	public channels: string[] = config.bot.default_channels;
	public setup: Function = (): void => {};
	public abstract execute: Function = (message: Message, args: string[]): void => {};

}

export default Command;
