/* eslint-disable consistent-return */
import { RichEmbed } from 'discord.js';
import axios from 'axios';
import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config } from '../../main';
import { formatDate } from '../../utils';

class PlayerInfos extends Command {
  constructor() {
    super('playerinfo');
    this.usage = `${config.bot.prefix}player-info <pseudo>`;
    this.examples.push('player-info noftaly');
    this.regex = /(?:player|joueur)-?info(?:rmation)?s?/gmui;
  }

  async execute(message, args) {
    const msg = await message.channel.send('Je vais chercher ça... (1/2)');

    // On récupère l'UUID du joueur a partir de son pseudo
    const uuid = await axios(`${config.apis.mojang_api}/users/profiles/minecraft/${args[0]}`, { method: 'GET' })
      .then(async (response) => {
        if (response.status === 204) { discordError('Impossible de trouver ce joueur, désolé', message); return -1; }
        if (response.status !== 200) { this.httpError(response, message); return -1; }
        return response.data.id;
      }).catch(err => console.error(err));

    if (uuid === -1) return;
    if (!uuid) return discordError('Une erreur est survenue, désolé.', message);

    msg.edit('Je vais chercher ça... (2/2)');
    // On récupère l'historique des pseudos du joueur
    const nameHystory = await axios(`${config.apis.mojang_api}/user/profiles/${uuid}/names`, { method: 'GET' })
      .then(async (response) => {
        if (response.status !== 200) return this.httpError(response, message);
        return response.data;
      }).catch(err => console.error(err));

    if (!nameHystory) return discordError('Une erreur est survenue, désolé.', message);

    msg.delete();
    this.sendDetails(message, nameHystory, uuid);
  }

  sendDetails(message, data, uuid) {
    const embed = new RichEmbed()
      .setColor(config.colors.default)
      .setAuthor(`Informations sur l'UUID ${uuid}`, config.bot.avatar)
      .setFooter(`Executé par ${message.author.username} | Données fournies par https://api.mojang.com/ et http://cravatar.eu/`)
      .setTimestamp()
      .addField(this.config.embed.pseudo, `\`${data[data.length - 1].name}\``, false);

    embed.setThumbnail(`${config.apis.skin}${uuid}/128`);

    let history = '';
    if (data.length === 1) {
      history = this.config.noHistory;
    } else {
      let i = 1;
      for (const pseudo of data) {
        history += `${i} - \`${pseudo.name}\``;
        if (pseudo.changedToAt) history += `(changé ${formatDate(pseudo.changedToAt)})`;

        history += '\n';
        i += 1;
      }
    }
    embed.addField(this.config.embed.history, history, false);
    message.channel.send(embed);
  }

  httpError(response, message) {
    console.error(`[HTTP request failed] Error : ${response.status}`);
    discordError(`Une erreur est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status} ${response.status === 429 ? 'Trop de requêtes ! Attendez un peu...' : ''}`, message)
  }
}

export default PlayerInfos;
