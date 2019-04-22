/* eslint-disable multiline-comment-style */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-return-assign */
/* eslint-disable sort-keys */
import Discord from 'discord.js';
import https from 'https';
import Config from '../../config/config.json';

/*
 * Variables :
 * data : Objet contenant tous les addons, chaque addons contenant 1 tableau
 * Object.keys(data.data) : Tableau contenant tous les addons (avec case)
 * addons : Tableau contenant tous les addons (sans case)
 * myAddon : String avec le nom de l'addon recherché (avec case)
 * versions : Liste de toutes les versions de l'addon recherché
 * latest : Dernière version de l'addon recherché
 */

export default {

    title: "Addon",
    description: "Avoir diverses informations sur un addon.",
    examples: ['addon-info', 'addonsinfos'],
    regex: /add?ons?-?infos?/gmui,
    permissions: [],

    execute: async (message, command, args) => {
        let data = '';
        https.get('https://api.skripttools.net/v4/addons/', resp => {
            resp.on('data', chunk => data += chunk); // Un bout de la requête a été recu. On l'ajoute a notre data.
            resp.on('end', () => { // La requête est terminée.
                data = JSON.parse(data);

                const addons = [],
                    myAddon = args[0];

                for (let a of Object.keys(data.data)) addons.push(a.toLowerCase());

                if (addons.includes(myAddon.toLowerCase())) {
                    let versions;
                    for (let a of Object.keys(data.data)) {
                        if (a.toLowerCase() === myAddon.toLowerCase()) {
                            versions = data.data[a];
                        }
                    }
                    let latest = versions[versions.length - 1];
                    latest = latest.replace(" ", "+");

                    https.get(`https://api.skripttools.net/v4/addons/${latest}`, resp2 => {
                        data = '';
                        resp2.on('data', chunk => data += chunk);
                        resp2.on('end', () => {
                            data = JSON.parse(data);
                            const nodata = Config.messages.errors.nodata;
                            const embed = new Discord.RichEmbed()
                                .setColor(Config.bot.color)
                                .setAuthor(`Informations sur ${myAddon}`, "https://cdn.discordapp.com/avatars/434031863858724880/296e69ea2a7f0d4e7e82bc16643cdc60.png?size=128")
                                .setDescription(data.data.description || "Aucune description disponible.")
                                .addField("Auteur(s)", data.data.author || nodata, true)
                                .addField("Dernière version", data.data.version || nodata, true)
                                .addField("Lien de téléchargement", data.data.download || nodata, true)
                                .addField("Code source", data.data.sourcecode || nodata, true)
                                .addField("Dépendences obligatoires", data.data.depend.depend || "Skript", true)
                                .addField("Dépendences facultatives", data.data.depend.softdepend || "Aucune", true)
                                .setFooter(`Executé par ${message.author.username} | Données fournies par skripttools.net`);
                            message.channel.send(embed);
                        });
                    }).on("error", err => console.error(err));

                } else {
                    message.channel.send(`Désolé, mais il est impossible d'acceder à cet addon. Es-tu sur qu'il est disponible sur <https://skripttools.net/addons?q=${args[0]}> ? `);
                }
            });
        }).on("error", err => console.error(err));
    }
};
