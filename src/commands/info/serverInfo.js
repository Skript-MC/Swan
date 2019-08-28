/* eslint-disable curly */
import { RichEmbed } from 'discord.js';
import axios from 'axios';
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config } from '../../main';

class ServerInfo extends Command {
  constructor() {
    super('serverinfo');
    this.regex = /se?rv(?:eu?r)?-?info(?:rmation)?s?/gimu;
    this.usage = `${config.bot.prefix}serveur-info <IP>`;
    this.examples.push('serv-info hypixel.net');
  }

  async execute(message, args) {
    const msg = await message.channel.send('Je vais chercher ça...');
    const data = await axios(`${config.apis.server}${args[0]}`, { method: 'GET' })
      .then(async (response) => {
        if (response.status !== 200) {
          console.error(`[HTTP request failed] Error : ${response.status}`);
          return discordError(`Une erreur est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status}`, message)
        }
        return response.data;
      }).catch(err => console.error(err));

    if (!data) return discordError('Aucun serveur ne correspond à votre requête !', message);
    return this.sendDetails(message, msg, data, args[0]);
  }

  sendDetails(message, msg, data, ip) {
    const embed = new RichEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Informations sur ${ip}`, config.bot.avatar)
      .setFooter(`Executé par ${message.author.username} | Données fournies par https://api.mcsrvstat.us/`)
      .setTimestamp();

    if (data.online != undefined)
      embed.addField(this.config.embed.status, (data.online ? 'En ligne' : 'Hors ligne'), true);
    if (data.ip)
      embed.addField(this.config.embed.ip, `\`${data.ip}${data.port ? `:${data.port}` : ''}\``, true);
    if (data.players)
      embed.addField(this.config.embed.players, `${data.players.online}/${data.players.max}`, true);
    if (data.version)
      embed.addField(this.config.embed.version, data.version, true);
    if (data.hostname)
      embed.addField(this.config.embed.hostname, data.hostname, true);
    if (data.software)
      embed.addField(this.config.embed.software, data.software, true);
    if (data.plugins)
      embed.addField(this.config.embed.plugins, data.plugin.raw.length, true);
    if (data.mods)
      embed.addField(this.config.embed.mods, data.mods.raw.length, true);

    msg.edit(embed);
  }
}

export default ServerInfo;
