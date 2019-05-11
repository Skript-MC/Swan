import { Message, Client, RichEmbed } from "discord.js";
import Command from '../components/Command';
import config from "../../../config/config.json";

class Code extends Command {

    name = 'code';
    shortDescription = config.messages.commands.code.shortDesc;
    longDescription = config.messages.commands.code.longDesc;
    usage = '${config.bot.prefix}code';
    examples = ['.code broadcast "code skript"'];
    regex = /code/gmui;
    channels = ['215217809687445504', '483673337223184394', '396976352487669762', '483673411394994177']; //ids des salons d'aides, les ids sont dans l'ordre des salons

    execute = async (message, args) => {
        message.delete();
        let embed = new RichEmbed().setColor(config.bot.color)
        if (args.length < 1){
            embed.setAuthor('Commande Incorrecte')
            embed.setDescription('Usage : /code <texte> \nExemple: .code broadcast "ceci est du code skript"')
            embed.setFooter('Commande executé par ' + message.author.username);
            message.channel.send(embed);
        } else {
            embed.setAuthor('Code de ' + message.author.username)
            embed.setDescription('```' + message.content.replace(".code ", "") + '```')
            embed.setFooter('Commande executé par ' + message.author.username);
            message.channel.send(embed);
        }
    }
}

export default Code;