import Command from '../../components/Command';
import Discord from 'discord.js';
import { config } from '../../main';

const reactionsNumbers = ['🇽', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣'];
const reactionsPage = ['⏮', '◀', '🇽', '▶', '⏭'];
const maxPage = 5;

class Links extends Command {

	constructor () {
		super('Links');
		this.regex = /(link|lien)s?/gmui;
		this.usage = 'link [<la page que vous souhaitez>]';
		this.example = 'link 3';
	}

	async execute(message, args, page) {
		page = args[0] ? args[0] : page;
		page = isNaN(page) ? 0 : page;
		const embed = new Discord.RichEmbed()
			.setAuthor(`Liens utiles (${page}/${maxPage})`, config.bot.avatar)
			.setFooter(`Executé par ${message.author.username}`)
			.setTimestamp();

		switch (Number(page)) {
			case 1:
				embed.addField(this.config.embed.docSkSkMc_title, this.config.embed.docSkSkMc_desc, true)
					.addField(this.config.embed.docSkOffi_title, this.config.embed.docSkOffi_desc, true);
				break;
			case 2:
				embed.addField(this.config.embed.docAddSkMc_title, this.config.embed.docAddSkMc_desc, true)
					.addField(this.config.embed.docAdd_title, this.config.embed.docAdd_desc, true);
				break;
			case 3:
				embed.addField(this.config.embed.dlSk_title, this.config.embed.dlSk_desc, true)
					.addField(this.config.embed.dlAdd_title, this.config.embed.dlAdd_desc, true);
				break;
			case 4:
				embed.addField(this.config.embed.discSkMc_title, this.config.embed.discSkMc_desc, true)
					.addField(this.config.embed.discSkCh_title, this.config.embed.discSkCh_desc, true);
				break;
			case 5:
				embed.addField(this.config.embed.forumSkMc_title, this.config.embed.forumSkMc_desc, true)
					.addField(this.config.embed.gitSk_title, this.config.embed.gitSk_desc, true);
				break;
			default:
				embed.setDescription(this.config.embed.summary);
				break;
		}

		let msgLinks = await message.channel.send(embed);
		if (page === 0) {
			for (let r of reactionsNumbers) await msgLinks.react(r);
			embed.setColor(config.bot.color)
			msgLinks.edit(embed);

			const collector = msgLinks
				.createReactionCollector(
					(reaction, user) => 
						user.id === message.author.id &&
						reactionsNumbers.includes(reaction.emoji.name)
				).once("collect", reaction => {
					msgLinks.delete();
					if (reaction.emoji.name === '🇽') message.delete();
					else this.execute(message, args, reactionsNumbers.indexOf(reaction.emoji.name));
					collector.stop();
				});
		} else {
			for (let r of reactionsPage) await msgLinks.react(r);
			embed.setColor(config.bot.color)
			msgLinks.edit(embed);
			this.reactionCollector(message, args, msgLinks, page);
		}
	};

	// Fonction appelée lorsque l'on réagis avec une réaction de type reactionsPage (donc quand on est pas sur le sommaire)
	reactionCollector = async (message, args, msgLinks, page) => {
		const collector = msgLinks
			.createReactionCollector(
				(reaction, user) =>
					!user.bot &&
					user.id === message.author.id &&
					reactionsPage.includes(reaction.emoji.name)
			).once("collect", reaction => {
				msgLinks.delete();
				if (reaction.emoji.name === '⏮') {
					this.execute(message, args, 0);
				} else if (reaction.emoji.name === '◀') {
					const prevPage = page <= 0 ? maxPage : page - 1;
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

}

export default Links;
