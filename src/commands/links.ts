/* eslint-disable sort-keys */
import Discord, { Message, ReactionCollector, RichEmbed } from 'discord.js';
import config from '../../config/config.json';
import Command from '../components/Command';

const maxPage: number = 5;
const reactionsNumbers: Array<string> = ['🇽', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣'];
const reactionsPage: Array<string> = ['⏮', '◀', '🇽', '▶', '⏭'];
const conf = config.messages.commands.links;

class Links extends Command {

	name: string = "Liens importants";
	description: string = conf.description;
	examples: string[] = ['lien', 'liens', 'links'];
	regex: RegExp = /(?:link|lien)s?/gmui;

	execute = async (message: Message, args: string[], page?: number): Promise<void> => {
		page = Number.isInteger(page) ? page : 0;
		const embed: RichEmbed = new RichEmbed()
			.setColor(config.bot.color)
			.setAuthor(`Liens utiles (${page + 1}/${maxPage + 1})`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
			.setDescription('‌‌ ') // Caractère invisible (‌‌ )
			.setFooter("Executé par " + message.author.username);

		switch (page) {
			case 1:
				embed.addField(conf.embed.docSkSkMc_title, conf.embed.docSkSkMc_desc, true)
					.addField(conf.embed.docSkOffi_title, conf.embed.docSkOffi_desc, true);
				break;
			case 2:
				embed.addField(conf.embed.docAddSkMc_title, conf.embed.docAddSkMc_desc, true)
					.addField(conf.embed.docAdd_title, conf.embed.docAdd_desc, true);
				break;
			case 3:
				embed.addField(conf.embed.dlSk_title, conf.embed.dlSk_desc, true)
					.addField(conf.embed.dlAdd_title, conf.embed.dlAdd_desc, true);
				break;
			case 4:
				embed.addField(conf.embed.discSkMc_title, conf.embed.discSkMc_desc, true)
					.addField(conf.embed.discSkCh_title, conf.embed.discSkCh_desc, true);
				break;
			case 5:
				embed.addField(conf.embed.forumSkMc_title, conf.embed.forumSkMc_desc, true)
					.addField(conf.embed.gitSk_title, conf.embed.gitSk_desc, true);
				break;
			default:
				embed.setDescription(conf.embed.summary);
				break;
		}

		let msgLinks: Message = <Message> await message.channel.send(embed);
		if (page === 0) {
			for (let r of reactionsNumbers) await msgLinks.react(r);
			const collector: ReactionCollector = msgLinks
				.createReactionCollector(
					(reaction, user) => 
						user.id === message.author.id &&
						reactionsNumbers.includes(reaction.emoji.name)
				)
				.once("collect", reaction => {
					msgLinks.delete();
					if (reaction.emoji.name === '🇽') message.delete();
					else this.execute(message, args, reactionsNumbers.indexOf(reaction.emoji.name));
					collector.stop();
				});
		} else {
			for (let r of reactionsPage) await msgLinks.react(r);
			this.reactionCollector(message, args, msgLinks, page);
		}
	};

	// Fonction appelée lorsque l'on réagis avec une réaction de type reactionsPage (donc quand on est pas sur le sommaire)
	reactionCollector = async (message: Message, args: string[], msgLinks: Message, page: number) => {
		const collector: ReactionCollector = msgLinks
			.createReactionCollector(
				(reaction, user) =>
					!user.bot &&
					user.id === message.author.id &&
					reactionsPage.includes(reaction.emoji.name)
			)
			.once("collect", reaction => {
				msgLinks.delete();
				if (reaction.emoji.name === '⏮') {
					this.execute(message, args, 0);
				} else if (reaction.emoji.name === '◀') {
					const prevPage: number = page <= 0 ? maxPage : page - 1;
					this.execute(message, args, prevPage);
				} else if (reaction.emoji.name === '🇽') {
					message.delete();
				} else if (reaction.emoji.name === '▶') {
					const nextPage = page + 1 > maxPage ? 0 : page + 1;
					this.execute(message, args, nextPage);
				} else if (reaction.emoji.name === '⏭') {
					this.execute(message, args, maxPage);
				}
				collector.stop();
			});
	}
};

export default Links;
