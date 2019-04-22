/* eslint-disable multiline-comment-style */
/* eslint-disable sort-keys */
import Discord from 'discord.js';

export default {

    title: "Sondage",
    description: "Lancer un sondage par lequel on peut répondre Oui ou Non.",
    examples: ['poll 10min Mon_titre Ma description'],
    regex: /poll|vote/gmui,
    permissions: ['Staff', 'Membre Actif', 'Ancien', 'Donateur', 'Retired Staff'], // Tout le monde qui a un rôle

    execute: async (message, args) => {
        const durations = {
            's(ec(ond)?)?e?': 1,
            'min(ute)?': 60,
            'h(our|eure?)?': 3600,
            '(d(ay)?)|(j(our)?)': 86400
        };

        for (let duration of Object.keys(durations)) {
            if (args[0].match(new RegExp(duration, 'gmui'))) {
                let msg, wait, embed;
                let no = 0,
                    yes = 0;
                // let mult = durations[duration], time = args[0].split(/[a-zA-Z]+/gmui)[0];
                // wait = mult * time * 1000;
                wait = durations[duration] * args[0].split(/[a-zA-Z]+/gmui)[0] * 1000;
                embed = new Discord.RichEmbed()
                    .setColor(3447003)
                    .setAuthor(`Vote de ${message.author.username}`, message.author.avatarURL)
                    .setTitle(args[1].replace(/_/gmu, ' '))
                    .setDescription(`${args.splice(2, args.length).join(' ')}\n\nCe vote dure : ${args[0]}`)
                    .setTimestamp(new Date());

                msg = await message.channel.send(embed);
                await msg.react('✅');
                await msg.react('❌');
                const collector = msg
                    .createReactionCollector((reaction, user) => !user.bot && (reaction.emoji.name === '❌' || reaction.emoji.name === '✅'))
                    .once("collect", reaction => {
                        if (reaction.emoji.name === '❌') no += 1;
                        else yes += 1;
                    });

                setTimeout(() => {
                    embed = new Discord.RichEmbed()
                        .setColor(0x7FFF00)
                        .setAuthor(`Vote de ${message.author.username}`, message.author.avatarURL)
                        .setTitle(args[1].replace(/_/gmu, ' '))
                        .setDescription(`${args.splice(2, args.length).join(' ')}\n\nCe vote est finit !\n\n**Résultats :**\n:white_check_mark: : ${yes}\n:x: : ${no}`)
                        .setTimestamp(new Date());
                    collector.stop();
                    msg.edit(embed).clearReactions();
                }, wait);
                break;
            } else {
                message.reply("il doit y avoir un problème dans ta commande... Vérifies qu'elle soit construite de cette façon :\n```.sond DURÉE TITRE DESCRIPTION```\n__DURÉE__ est composée de nombres suivis sans espaces de `s` pour `seconde` ou de `min` pour `minute` ou de `h` pour `heure` ou de `j` pour `jour`.\n__TITRE__ est un texte, sans espace. Les \"_\" du titre seront convertis en espaces.\n__DESCRIPTION__ est un texte, avec espace. Ce champs est facultatif.\nExemple : ```.sond 10min Mon_titre Je créé un sondage !```");
            }
        }
    }
};
