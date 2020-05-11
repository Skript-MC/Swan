import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import axios from 'axios';
import Command from '../../structures/Command';
import { config, logger } from '../../main';

class PlayerInfos extends Command {
  constructor() {
    super('Player Info');
    this.aliases = ['playerinfo', 'player_info', 'player-info'];
    this.usage = 'player-info <pseudo>';
    this.examples = ['player-info noftaly'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.invalidCmd, message.member);
    const msg = await message.channel.send(this.config.searching1);

    // On récupère l'UUID du joueur a partir de son pseudo
    const uuid = await axios(`${config.apis.mojang_api}/users/profiles/minecraft/${args[0]}`)
      .then(async (response) => {
        if ([204, 400, 404].includes(response.status)) { message.channel.sendError(this.config.playerNotFound, message.member); return -1; }
        if (response.status !== 200) { this.httpError(response, message); return -1; }
        return response.data.id;
      }).catch(console.error);

    if (uuid === -1) return;
    if (!uuid) return message.channel.sendError(this.config.error, message.member);

    msg.edit(this.config.searching2);
    // On récupère l'historique des pseudos du joueur
    const nameHystory = await axios(`${config.apis.mojang_api}/user/profiles/${uuid}/names`)
      .then(async (response) => {
        if (response.status !== 200) return this.httpError(response, message);
        return response.data;
      }).catch(console.error);

    if (!nameHystory) return message.channel.sendError(this.config.error, message.member);

    msg.delete();
    this.sendDetails(message, nameHystory, uuid);
  }

  sendDetails(message, data, uuid) {
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor(`Informations sur l'UUID ${uuid}`, 'attachment://logo.png')
      .setFooter(`Exécuté par ${message.author.username} | Données fournies par https://api.mojang.com/ et http://cravatar.eu/`)
      .setTimestamp()
      .addField(this.config.embed.pseudo, `\`${data[data.length - 1].name}\``, false);

    embed.setThumbnail(`${config.apis.skin}${uuid}/128`);

    let history = '';
    if (data.length === 1) {
      history = this.config.noHistory;
    } else {
      let i = 1;
      for (const pseudo of data) {
        history += `${i} - \`${pseudo.name}\` ${pseudo.changedToAt ? `(changé ${moment(pseudo.changedToAt).format('[le] DD/MM/YYYY [à] HH:mm:ss')})` : ''}`;

        history += '\n';
        i += 1;
      }
    }
    embed.addField(this.config.embed.history, history, false);
    message.channel.send(embed);
  }

  httpError(response, message) {
    logger.error(`[HTTP request failed] Error : ${response.status}`);
    message.channel.sendError(`Une erreur est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status} ${response.status === 429 ? 'Trop de requêtes ! Attendez un peu...' : ''}`, message.member);
  }
}

export default PlayerInfos;
