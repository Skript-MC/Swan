import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { discordInfo, discordError } from '../../structures/messages';
import { convertFileSize } from '../../utils';
import { config } from '../../main';

class SkriptInfo extends Command {
  constructor() {
    super('Skript Info');
    this.aliases = ['skriptinfo', 'skript-info', 'skript_info', 'skriptinfos', 'skript-infos', 'skript_infos'];
    this.usage = 'skript-info';
    this.examples = ['skriptInfo'];
  }

  async execute(message, args) {
    if (args[0] && !['dl', 'download', 'link', 'links'].includes(args[0])) return message.channel.send(discordError(this.config.invalidCmd, message));
    console.log(args[0]);
    if (!args[0] || ['dl', 'download'].includes(args[0])) {
      const options = { Accept: 'Accept: application/vnd.github.v3+json' };
      const githubReleases = await axios(`${config.apis.github}/repos/SkriptLang/Skript/releases`, options)
        .catch(console.error);

      const lastRelease = githubReleases.data[0];
      const lastStableRelease = githubReleases.data.filter(elt => !elt.prerelease).shift();

      let downloadDesc = `
        [Dernière version : ${lastRelease.tag_name}](${lastRelease.html_url}) (${convertFileSize(lastRelease.assets[0].size)})`;

      if (lastRelease !== lastStableRelease) {
        downloadDesc += `\n
          [Dernière version stable : ${lastStableRelease.tag_name}](${lastStableRelease.html_url}) (${convertFileSize(lastStableRelease.assets[0].size)})`;
      }

      const embed = new MessageEmbed()
        .setColor(config.colors.default)
        .attachFiles([config.bot.avatar])
        .setAuthor('Informations sur Skript', 'attachment://logo.png')
        .addField(this.config.embed.download, downloadDesc, true)
        .setFooter(`Exécuté par ${message.author.username} | Données fournies par https://skripttools.net`)
        .setTimestamp();

      message.channel.send(embed);
    } 
    if (!args[0] || ['links', 'link'].includes(args[0])) {
      message.channel.send(discordInfo(this.config.embed.verInfo_desc, message));
    }
  }
}

export default SkriptInfo;
