import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import Command from '../../helpers/Command';
import MusicBot from '../../helpers/Music';
import { config } from '../../main';
import { discordError } from '../../helpers/messages';
import { slugify } from '../../utils';

class Lyrics extends Command {
  constructor() {
    super('Lyrics');
    this.aliases = ['lyric', 'lyrics', 'parole', 'paroles'];
    this.usage = 'lyrics';
    this.examples.push('lyrics', 'paroles');
    this.cooldown = 10000;
  }

  async execute(message, _args) {
    const validate = MusicBot.canUseCommand(message, { songPlaying: true });
    if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.KSOFTSI_API}`,
      },
    };
    const apiResult = await axios(`${config.apis.lyrics}search?q=${slugify(MusicBot.nowPlaying.title)}`, options)
      .then(async (response) => {
        if (response.status !== 200) {
          console.error(`[HTTP request failed] Error : ${response.status}`);
          message.channel.send(discordError(`Une erreur est survenue lors de la reqûete... Veuillez réessayer plus tard.\nStatus de la requête : ${response.status} ${response.status === 429 ? 'Trop de requêtes ! Attendez un peu...' : ''}`, message));
          return -1;
        }
        return response.data.data;
      }).catch(err => console.error(err));

    if (apiResult === -1) return;
    if (!apiResult) return message.channel.send(discordError('Une erreur est survenue, désolé.', message));

    const lyrics = apiResult[0];
    const lyricsSplit = lyrics.lyrics.match(/(.|[\r\n]){1,1900}/g);

    const embeds = [];

    const firstEmbed = new MessageEmbed()
      .setColor(config.colors.default)
      .setDescription(lyricsSplit[0]);

    embeds.push(firstEmbed);

    for (let i = 1; i < lyricsSplit.length; i++) {
      const embed = new MessageEmbed()
        .setColor(config.colors.default)
        .setDescription(lyricsSplit[i]);
      embeds.push(embed);
    }

    if (lyrics.album_art) embeds[0].setThumbnail(lyrics.album_art);
    embeds[0].setTitle(`${lyrics.name} - ${lyrics.artist} (${lyrics.album})`);
    embeds[embeds.length - 1].setFooter(`Exécuté par ${message.author.username} | Données fournies par https://api.ksoft.si`);

    for (const embed of embeds) message.channel.send(embed);
  }
}

export default Lyrics;
