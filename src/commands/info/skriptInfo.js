import { MessageEmbed } from 'discord.js';
import Command from '../../components/Command';
import { discordInfo } from '../../components/Messages';
import { SkripttoolsSkript, config } from '../../main';

class SkriptInfo extends Command {
  constructor() {
    super('Skript Info');
    this.aliases = ['skriptinfo', 'skript-info', 'skript_info'];
    this.usage = 'skript-info';
    this.examples = ['skriptInfo'];
  }

  async execute(message, _args) {
    const skriptInfos = await SkripttoolsSkript;

    let size = -1;
    if (skriptInfos.data.bytes) size = skriptInfos.data.bytes / 1000000;
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor('Informations sur Skript', config.bot.avatar)
      .setFooter(`Éxécuté par ${message.author.username} | Données fournies par https://skripttools.net`)
      .setTimestamp();

    if (skriptInfos.data.author) embed.addField(this.config.embed.author, skriptInfos.data.author, true);
    if (skriptInfos.data.download) embed.addField(this.config.embed.download, `[Téléchargez ici](${skriptInfos.data.download}) ${size.toFixed(2)} Mo`, true);
    if (skriptInfos.data.source) embed.addField(this.config.embed.sourcecode, `[Voir ici](${skriptInfos.data.source})`, true);
    if (skriptInfos.data.version) embed.addField(this.config.embed.version, `${skriptInfos.data.version} (1.9 - 1.14)`, true);

    message.channel.send(embed);
    message.channel.send(discordInfo(this.config.embed.verInfo_desc, message));
  }
}

export default SkriptInfo;
