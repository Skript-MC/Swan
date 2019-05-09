import { RichEmbed, Guild } from "discord.js";
import config from '../../config/config.json';
import { error } from "./Messages";

/**
 * Fonction qui envoie un log des actions de modération
 * @param {Object} info - Informations sur l'action de modération:
 * - color: {string} couleur de l'embed
 * - user: {GuildMember} utilisateur qui a été sanctionné
 * - mod: {User} modérateur qui a sanctionné
 * - action: {string} sanction appliquée
 * - duration: {string} durée de la sanction
 * - finish: {string} fin de la sanciton
 * - reason: {string} raison de la sanction
 * - privateChannel: {GuildChannel} (facultatif) Channel privé créé entre le staff et l'utilisateur
 * @param {Guild} guild - Guild dans laquelle la sanction a été appliquée
 * @returns {Promise}
 * @async
 */
export async function modLog(info, guild) {
    const embed = new RichEmbed()
        .setColor(info.color)
        .setTitle(`Cas n°XXX`)
        .addField(":bust_in_silhouette: Utilisateur", `${info.member}\n(${info.member.id})`, true)
        .addField(":cop: Modérateur", `${info.mod}\n(${info.mod.id})`, true)
        .addField(":tools: Action", `${info.action}`, true);
    if (info.finish !== "") embed.addField(":stopwatch: Durée", `${info.duration}\nExpire ${info.finish}`, true);
    else embed.addField(":stopwatch: Durée", `${info.duration}`, true);
    embed.addField(":scroll: Raison", `${info.reason}`, true)
    if (info.privateChannel) embed.addField(":speech_left: Channel privé", `${info.privateChannel}`, true);
    embed.setFooter("Éxecuté")
        .setTimestamp();

    let chan = guild.channels.find(c => c.name === config.moderation.log.channelName && c.type === 'text');
	if (!chan) {
		try {
            chan = await guild.createChannel(config.moderation.log.channelName, 'text');
            chan.setParent(config.moderation.log.categoryID);
            chan.overwritePermissions(guild.roles.find(r => r.name === '@everyone'), {
                VIEW_CHANNEL: false
            });
            chan.overwritePermissions(guild.roles.find(r => r.name === 'Staff'), {
                VIEW_CHANNEL,
                ADD_REACTIONS,
                SEND_MESSAGES,
                SEND_TTS_MESSAGES,
                MANAGE_MESSAGES: false
            });
		} catch (err) {
			error(`Error while attempting to create the channel : ${err}`);
		}
    }
    chan.send(embed);
}
